"""CLI client for the same JSON service contract used by the backend."""
import argparse
import json
from routing.graph import load_graph
from routing.service import RoutingService, RouteRequestError

parser = argparse.ArgumentParser(description="Accessible walking route demo")
parser.add_argument("--start-lat", type=float, required=True)
parser.add_argument("--start-lon", type=float, required=True)
parser.add_argument("--end-lat", type=float, required=True)
parser.add_argument("--end-lon", type=float, required=True)
parser.add_argument("--unknown-policy", choices=["strict", "relaxed"], default="strict")
parser.add_argument("--max-walking-m", type=float, default=3000)
parser.add_argument("--max-snap-m", type=float, default=50)
parser.add_argument("--routes", type=int, default=3)
parser.add_argument("--non-wheelchair", action="store_true")
args = parser.parse_args()

graph = load_graph("data/campus.graphml")
service = RoutingService(graph)
payload = {
    "request_id": "local-cli-demo",
    "origin": {"latitude": args.start_lat, "longitude": args.start_lon},
    "destination": {"latitude": args.end_lat, "longitude": args.end_lon},
    "profile": {"wheelchair_user": not args.non_wheelchair,
                "unknown_accessibility_policy": args.unknown_policy,
                "walking_speed_mps": 1.0},
    "constraints": {"max_walking_distance_m": args.max_walking_m,
                    "max_snap_distance_m": args.max_snap_m,
                    "max_routes": args.routes},
}
try:
    print(json.dumps(service.route(payload), indent=2, default=str))
except RouteRequestError as exc:
    print(json.dumps({"status": "invalid_request", "error": str(exc)}, indent=2))
    raise SystemExit(2)
