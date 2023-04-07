import json
import torch

if __name__ == '__main__':
    parmas = {
        "isMPSAvailable": torch.backends.mps.is_available(),
        "isCUDAAvailable": torch.cuda.is_available()
    }
    print(json.dumps(parmas), end='')
