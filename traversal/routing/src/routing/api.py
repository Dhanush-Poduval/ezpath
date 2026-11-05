"""Optional FastAPI adapter. Core routing remains usable without FastAPI."""
from __future__ import annotations
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from .graph import load_graph
from .service import RoutingService, RouteRequestError


class Coordinate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

class Profile(BaseModel):
    wheelchair_user: bool = True
    unknown_accessibility_policy: str = "strict"
    walking_speed_mps: float = Field(default=1.0, gt=0)

class Constraints(BaseModel):
    max_walking_distance_m: float = Field(default=3000, ge=0)
    max_snap_distance_m: float = Field(default=50, gt=0)
    max_routes: int = Field(default=3, ge=1, le=10)

class RouteRequest(BaseModel):
    request_id: Optional[str] = None
    origin: Coordinate
    destination: Coordinate
    profile: Profile = Field(default_factory=Profile)
    constraints: Constraints = Field(default_factory=Constraints)


def create_app(graph_path: str = "data/campus.graphml") -> FastAPI:
    graph = load_graph(graph_path)
    service = RoutingService(graph)
    app = FastAPI(title="Accessible Routing API", version="0.2.0")
    app.state.routing_service = service

    @app.get("/health")
    def health():
        return {"status": "ok", "graph_version": service.graph_version,
                "nodes": graph.number_of_nodes(), "edges": graph.number_of_edges()}

    @app.post("/v1/routes")
    def create_route(request: RouteRequest):
        try:
            payload = request.model_dump() if hasattr(request, "model_dump") else request.dict()
            return service.route(payload)
        except RouteRequestError as exc:
            message = str(exc)
            status_code = 422 if "SNAP_DISTANCE_EXCEEDED" in message else 400
            raise HTTPException(status_code=status_code, detail={"code": "ROUTE_REQUEST_INVALID", "message": message})

    return app


app = create_app()
