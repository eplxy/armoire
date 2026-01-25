# bg-remover/main.py
from flask import Flask, request, send_file
from rembg import remove
import io

app = Flask(__name__)

@app.route('/remove', methods=['POST'])
def remove_bg():
    if 'image' not in request.files:
        return "No image provided", 400
        
    file = request.files['image'].read()
    result = remove(file)
    
    return send_file(io.BytesIO(result), mimetype='image/png')

if __name__ == '__main__':
    print("Background Remover running on port 5000...")
    app.run(host='0.0.0.0', port=5000)