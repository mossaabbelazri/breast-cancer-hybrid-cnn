import requests
import time

def test_api():
    url = "http://127.0.0.1:5000"
    
    print("Waiting for server to start...")
    # Polling for root endpoint
    for _ in range(30):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print("Server is up!")
                break
        except:
            time.sleep(2)
    else:
        print("Server failed to start in time.")
        return

    # Test prediction
    print("Testing /predict endpoint...")
    with open("test_sample.png", "rb") as f:
        files = {"file": f}
        try:
            response = requests.post(f"{url}/predict", files=files)
            print("Response:", response.json())
        except Exception as e:
            print(f"Prediction failed: {e}")

if __name__ == "__main__":
    test_api()
