from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import faiss
import requests
import os
import pickle
from PIL import Image
from io import BytesIO

app = FastAPI(title="Namadhu Kavalan AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DIMENSION  = 128
INDEX_FILE = "face_index.faiss"
META_FILE  = "face_meta.pkl"

index    = faiss.IndexFlatL2(DIMENSION)
metadata = []

def load_index():
    global index, metadata
    if os.path.exists(INDEX_FILE) and os.path.exists(META_FILE):
        index = faiss.read_index(INDEX_FILE)
        with open(META_FILE, "rb") as f:
            metadata = pickle.load(f)
        print(f"[FAISS] Loaded {index.ntotal} face embeddings")
    else:
        print("[FAISS] Starting with empty index")

def save_index():
    faiss.write_index(index, INDEX_FILE)
    with open(META_FILE, "wb") as f:
        pickle.dump(metadata, f)

load_index()

def download_image_as_array(url: str):
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    img = Image.open(BytesIO(response.content)).convert("RGB")
    img = img.resize((224, 224))
    return np.array(img)

def get_embedding(image_array: np.ndarray) -> Optional[List[float]]:
    try:
        from deepface import DeepFace
        fixed_path = "temp_face.jpg"
        img = Image.fromarray(image_array)
        img.save(fixed_path)
        result = DeepFace.represent(
            img_path=fixed_path,
            model_name="Facenet",
            enforce_detection=False,
        )
        if os.path.exists(fixed_path):
            os.remove(fixed_path)
        if result and len(result) > 0:
            emb = np.array(result[0]["embedding"], dtype=np.float32)
            if len(emb) != DIMENSION:
                emb = np.resize(emb, DIMENSION)
            norm = np.linalg.norm(emb)
            if norm > 0:
                emb = emb / norm
            return emb.tolist()
    except Exception as e:
        print(f"[Embedding] Error: {e}")
        if os.path.exists("temp_face.jpg"):
            os.remove("temp_face.jpg")
    return None

class ProcessFaceRequest(BaseModel):
    personId:   str
    imageUrl:   str
    personType: str

class SearchFaceRequest(BaseModel):
    imageUrl:   str
    searchType: str = "all"
    threshold:  float = 0.6
    topK:       int = 10

@app.get("/")
def root():
    return {"status": "Namadhu Kavalan AI Service running ✅", "total_faces": index.ntotal}

@app.get("/health")
def health():
    return {"status": "ok", "faces_indexed": index.ntotal}

@app.post("/process-face")
async def process_face(req: ProcessFaceRequest):
    try:
        print(f"[Process] Processing face for person {req.personId}")
        image_array = download_image_as_array(req.imageUrl)
        embedding   = get_embedding(image_array)
        if not embedding:
            raise HTTPException(status_code=422, detail="No face detected in image")
        emb_array = np.array([embedding], dtype=np.float32)
        index.add(emb_array)
        metadata.append({"personId": req.personId, "personType": req.personType, "faissIdx": index.ntotal - 1})
        save_index()
        print(f"[Process] ✅ Face added for {req.personId}. Total: {index.ntotal}")
        return {"success": True, "personId": req.personId, "embedding": embedding, "totalFaces": index.ntotal}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Process] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-face")
async def search_face(req: SearchFaceRequest):
    try:
        if index.ntotal == 0:
            return {"matches": [], "message": "No faces in database yet"}
        print(f"[Search] Searching against {index.ntotal} faces")
        image_array = download_image_as_array(req.imageUrl)
        embedding   = get_embedding(image_array)
        if not embedding:
            raise HTTPException(status_code=422, detail="No face detected in search image")
        emb_array = np.array([embedding], dtype=np.float32)
        k = min(req.topK, index.ntotal)
        distances, indices = index.search(emb_array, k)
        matches = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1: continue
            similarity = float(1 / (1 + dist))
            if similarity < req.threshold: continue
            meta = metadata[idx]
            if req.searchType != "all" and meta["personType"] != req.searchType: continue
            matches.append({"personId": meta["personId"], "personType": meta["personType"], "similarity": round(similarity, 4), "distance": round(float(dist), 4), "confidence": "HIGH" if similarity > 0.85 else "MEDIUM" if similarity > 0.7 else "LOW"})
        matches.sort(key=lambda x: x["similarity"], reverse=True)
        print(f"[Search] Found {len(matches)} matches")
        return {"matches": matches, "totalMatches": len(matches), "facesSearched": index.ntotal}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Search] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
def stats():
    return {"totalFaces": index.ntotal, "breakdown": {"missing": sum(1 for m in metadata if m["personType"] == "missing"), "unidentified": sum(1 for m in metadata if m["personType"] == "unidentified")}}