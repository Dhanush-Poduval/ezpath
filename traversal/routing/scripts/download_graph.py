import time
from pathlib import Path

import osmnx as ox

PLACE = "SRM Institute of Science and Technology"
OUTPUT = Path("data/campus.graphml")

OVERPASS_SERVERS = [
    "https://overpass-api.de/api",
    "https://overpass.kumi.systems/api",
    "https://overpass.nchc.org.tw/api",
]

MAX_RETRIES = 4

def download_graph():
    if OUTPUT.exists():
        print(f"Existing graph found: {OUTPUT}")
        print("Skipping download.")
        return ox.load_graphml(OUTPUT)

    print("Getting campus boundary...")

    boundary = ox.geocode_to_gdf(PLACE)

    if boundary.empty:
        raise RuntimeError("Could not find the SRM campus boundary.")

    polygon = boundary.geometry.iloc[0]

    last_error = None

    for server in OVERPASS_SERVERS:
        print(f"\nTrying Overpass server: {server}")

        ox.settings.overpass_url = server

        for attempt in range(MAX_RETRIES):
            try:
                print(f"Download attempt {attempt + 1}/{MAX_RETRIES}")

                graph = ox.graph_from_polygon(
                    polygon,
                    network_type="walk",
                    simplify=True,
                    retain_all=True,
                )

                OUTPUT.parent.mkdir(parents=True, exist_ok=True)
                ox.save_graphml(graph, OUTPUT)

                print("\nGraph downloaded successfully!")
                print("Nodes:", len(graph.nodes))
                print("Edges:", len(graph.edges))
                print("Saved:", OUTPUT)

                return graph

            except Exception as error:
                last_error = error

                wait = 2 ** (attempt + 1)

                print(f"Download failed: {error}")
                print(f"Retrying in {wait} seconds...")

                time.sleep(wait)

    raise RuntimeError(
        "All Overpass servers failed. "
        "Try again later."
    ) from last_error


if __name__ == "__main__":
    download_graph()
