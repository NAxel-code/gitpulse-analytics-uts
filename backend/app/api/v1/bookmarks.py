from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.postgres import postgres_service

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

class BookmarkCreate(BaseModel):
    repo_name: str = Field(..., example="facebook/react", description="Owner/repo full name")
    category: str = Field(default="General", example="Frontend", description="Repository category")
    description: Optional[str] = Field(default="", example="The library for web and native user interfaces")
    stars: Optional[int] = Field(default=0, example=225000)

class BookmarkResponse(BaseModel):
    id: int
    repo_name: str
    category: str
    description: Optional[str]
    stars: int
    created_at: str

@router.post("/", status_code=status.HTTP_201_CREATED, summary="Create a new repository bookmark")
def create_bookmark(payload: BookmarkCreate):
    """
    Endpoint Tulis (POST) ke Database PostgreSQL (Persyaratan Soal 2).
    Menyimpan repository ke dalam daftar pantau (bookmark) pada PostgreSQL.
    Status Code: 201 Created.
    """
    try:
        data = postgres_service.create_bookmark(
            repo_name=payload.repo_name,
            category=payload.category,
            description=payload.description or "",
            stars=payload.stars or 0
        )
        return {
            "status": "success",
            "message": f"Repository '{payload.repo_name}' successfully bookmarked in PostgreSQL database",
            "data": data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save bookmark to database: {str(e)}"
        )

@router.get("/", status_code=status.HTTP_200_OK, summary="List all bookmarked repositories")
def get_bookmarks(limit: int = 50, offset: int = 0):
    """
    Endpoint Baca (GET) dari Database PostgreSQL (Persyaratan Soal 2).
    Mengambil seluruh daftar repository yang dipantau dari PostgreSQL.
    Status Code: 200 OK.
    """
    try:
        items = postgres_service.list_bookmarks(limit=limit, offset=offset)
        return {
            "status": "success",
            "total": len(items),
            "data": items
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch bookmarks from database: {str(e)}"
        )

@router.delete("/{bookmark_id}", status_code=status.HTTP_200_OK, summary="Delete a bookmark")
def delete_bookmark(bookmark_id: int):
    """Hapus bookmark repository berdasarkan ID."""
    try:
        success = postgres_service.delete_bookmark(bookmark_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bookmark not found")
        return {"status": "success", "message": f"Bookmark {bookmark_id} deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete bookmark: {str(e)}"
        )
