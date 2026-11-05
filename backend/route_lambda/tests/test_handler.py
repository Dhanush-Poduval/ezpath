import json

import networkx as nx

from backend.route_lambda.handler import handle_event
from routing.service import RoutingService


def _service() -> RoutingService:
    graph = nx.MultiDiGraph()
    graph.graph.update(
        crs="EPSG:4326",
        routing_graph_version="lambda-test-v1",
        routing_source="synthetic Lambda adapter test",
    )
    graph.add_node(1, x=0.0, y=0.0)
    graph.add_node(2, x=0.001, y=0.0)
    graph.add_edge(1, 2, key=0, length=111.2, wheelchair="yes")
    return RoutingService(graph)


def _event(payload) -> dict:
    return {
        "version": "2.0",
        "routeKey": "POST /v1/routes",
        "body": json.dumps(payload),
        "isBase64Encoded": False,
    }


def test_route_request_returns_api_gateway_response():
    response = handle_event(
        _event(
            {
                "request_id": "lambda-test-1",
                "origin": {"latitude": 0.0, "longitude": 0.0},
                "destination": {"latitude": 0.0, "longitude": 0.001},
                "profile": {
                    "wheelchair_user": True,
                    "unknown_accessibility_policy": "strict",
                },
                "constraints": {
                    "max_snap_distance_m": 30,
                    "max_walking_distance_m": 500,
                    "max_routes": 3,
                },
            }
        ),
        _service(),
    )

    assert response["statusCode"] == 200
    payload = json.loads(response["body"])
    assert payload["request_id"] == "lambda-test-1"
    assert payload["status"] == "ok"
    assert payload["graph"]["version"] == "lambda-test-v1"
    assert payload["routes"][0]["accessibility"]["status"] == "tag_supported"


def test_invalid_json_returns_400():
    response = handle_event({"body": "{"}, _service())

    assert response["statusCode"] == 400
    payload = json.loads(response["body"])
    assert payload["error"]["code"] == "ROUTE_REQUEST_INVALID"


def test_health_returns_loaded_graph_metadata():
    response = handle_event({"routeKey": "GET /health"}, _service())

    assert response["statusCode"] == 200
    payload = json.loads(response["body"])
    assert payload == {
        "status": "ok",
        "graph_version": "lambda-test-v1",
        "nodes": 2,
        "edges": 1,
    }


def test_snap_distance_error_returns_422():
    response = handle_event(
        _event(
            {
                "origin": {"latitude": 1.0, "longitude": 1.0},
                "destination": {"latitude": 0.0, "longitude": 0.001},
                "constraints": {"max_snap_distance_m": 10},
            }
        ),
        _service(),
    )

    assert response["statusCode"] == 422
