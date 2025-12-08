"""
Flask Web Server for FIFA Card Creator
السيرفر الخلفي لمنشئ بطاقات FIFA
"""

from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import sys
import base64
from io import BytesIO
from PIL import Image

# Add parent directory to path to import cardcreator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from resources.player import Player
from cardcreator import render_card
from database import add_card_to_database, get_all_cards, get_random_cards, get_card_by_id

app = Flask(__name__, static_folder='web', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Configuration
OUTPUT_DIR = 'finished-fut-cards'
WEB_DIR = 'web'


@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory(WEB_DIR, 'index.html')


@app.route('/api/create-card', methods=['POST'])
def create_card():
    """
    Create a FIFA card from JSON data
    
    Expected JSON format:
    {
        "name": "SALAH",
        "position": "RW",
        "club": "10",
        "country": "eg",
        "overall": 90,
        "pac": 93,
        "dri": 90,
        "sho": 87,
        "def": 45,
        "pas": 81,
        "phy": 75,
        "cardType": "TOTY"
    }
    """
    try:        # Get JSON data
        data = request.get_json()
        
        # Validate data
        required_fields = ['name', 'position', 'club', 'country', 'overall', 
                          'pac', 'dri', 'sho', 'def', 'pas', 'phy', 'cardType']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
          # Handle uploaded image
        player_image_path = None
        if 'image' in data and data['image']:
            try:
                # Decode base64 image
                image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
                image_bytes = base64.b64decode(image_data)
                
                # Save temporary image in the temp/ folder (same as cardcreator expects)
                temp_dir = 'temp'
                if not os.path.exists(temp_dir):
                    os.makedirs(temp_dir)
                
                import time
                temp_image_name = f"uploaded_{int(time.time())}.png"
                player_image_path = os.path.join(temp_dir, temp_image_name)
                
                # Open and save image
                img = Image.open(BytesIO(image_bytes))
                img.save(player_image_path, 'PNG')
                
                # Convert to absolute path
                player_image_path = os.path.abspath(player_image_path)
                print(f"Saved uploaded image to: {player_image_path}")
                
            except Exception as e:
                print(f"Error processing image: {str(e)}")
                player_image_path = None
        
        # Create player object
        player = Player(
            name=data['name'].upper(),
            pos=data['position'],
            club=data['club'],
            country=data['country'],
            overall=int(data['overall']),
            pac=int(data['pac']),
            dri=int(data['dri']),
            sho=int(data['sho']),
            deff=int(data['def']),
            pas=int(data['pas']),
            phy=int(data['phy']),
            language='EN'
        )
          # Generate unique status_id
        import time
        status_id = f"web_{int(time.time())}"
          # Create card
        output_path = render_card(
            player=player,
            card_code=data['cardType'],
            player_image_url=player_image_path,
            dynamic_img_fl=False,
            status_id=status_id
        )
          # Save player metadata for Formation Planner
        try:
            import json
            metadata = {
                'name': data['name'].upper(),
                'position': data['position'],
                'overall': int(data['overall']),
                'pac': int(data['pac']),
                'dri': int(data['dri']),
                'sho': int(data['sho']),
                'def': int(data['def']),
                'pas': int(data['pas']),
                'phy': int(data['phy']),
                'club': data['club'],
                'country': data['country'],
                'cardType': data['cardType'],
                'timestamp': int(time.time()),
                'hasImage': player_image_path is not None,
                'filename': os.path.basename(output_path)
            }
            
            # Save metadata JSON file alongside card image
            metadata_path = output_path.replace('.png', '_metadata.json')
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
            
            # Save to database
            add_card_to_database(status_id, metadata)
            print(f"✅ Card saved to database with ID: {status_id}")
                
        except Exception as e:
            print(f"Warning: Could not save metadata: {str(e)}")
        
        # Read the generated image and convert to base64 for preview
        with open(output_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        # Return success response with image data
        return jsonify({
            'success': True,
            'message': 'Card created successfully!',
            'filename': os.path.basename(output_path),
            'path': output_path,
            'imageData': f'data:image/png;base64,{image_data}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/download/<filename>')
def download_card(filename):
    """Download a created card"""
    try:
        return send_file(
            os.path.join(OUTPUT_DIR, filename),
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404


@app.route('/api/preview/<filename>')
def preview_card(filename):
    """Preview a created card"""
    try:
        return send_from_directory(OUTPUT_DIR, filename)
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404


@app.route('/api/cards', methods=['GET'])
def list_cards():
    """List all created cards"""
    try:
        if not os.path.exists(OUTPUT_DIR):
            return jsonify({
                'success': True,
                'cards': []
            })
        
        cards = []
        for filename in os.listdir(OUTPUT_DIR):
            if filename.endswith('.png'):
                file_path = os.path.join(OUTPUT_DIR, filename)
                cards.append({
                    'filename': filename,
                    'size': os.path.getsize(file_path),
                    'created': os.path.getctime(file_path)
                })
        
        # Sort by creation time (newest first)
        cards.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify({
            'success': True,
            'cards': cards
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/get-cards', methods=['GET'])
def get_cards():
    """
    Get list of all created FIFA cards with metadata
    Returns card images as base64 for display along with player info
    """
    try:
        import json
        cards = []
        output_path = os.path.abspath(OUTPUT_DIR)
        
        if os.path.exists(output_path):
            # Get all PNG files in the output directory
            card_files = [f for f in os.listdir(output_path) if f.endswith('.png')]
            
            # Sort by modification time (newest first)
            card_files.sort(key=lambda x: os.path.getmtime(os.path.join(output_path, x)), reverse=True)
            
            # Limit to last 20 cards to avoid large response
            card_files = card_files[:20]
            
            for card_file in card_files:
                card_path = os.path.join(output_path, card_file)
                
                # Read and encode image
                with open(card_path, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode('utf-8')
                
                # Try to load metadata
                metadata_path = card_path.replace('.png', '_metadata.json')
                metadata = None
                if os.path.exists(metadata_path):
                    try:
                        with open(metadata_path, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                    except Exception as e:
                        print(f"Could not load metadata for {card_file}: {e}")
                
                card_data = {
                    'filename': card_file,
                    'imageData': f'data:image/png;base64,{image_data}',
                    'timestamp': os.path.getmtime(card_path)
                }
                
                # Add metadata if available
                if metadata:
                    card_data['metadata'] = metadata
                
                cards.append(card_data)
        
        return jsonify({
            'success': True,
            'cards': cards,
            'total': len(cards)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'FIFA Card Creator API is running!',
        'version': '1.0.0'
    })


@app.route('/api/random-players', methods=['GET'])
def get_random_players():
    """Get random players for formation (default 6)"""
    try:
        count = int(request.args.get('count', 6))
        cards = get_random_cards(count)
        
        # Load images for each card
        import base64
        result_cards = []
        
        for card in cards:
            if 'filename' in card and card['filename']:
                card_path = os.path.join(OUTPUT_DIR, card['filename'])
                if os.path.exists(card_path):
                    try:
                        with open(card_path, 'rb') as f:
                            image_data = base64.b64encode(f.read()).decode('utf-8')
                        
                        result_cards.append({
                            'filename': card['filename'],
                            'imageData': f'data:image/png;base64,{image_data}',
                            'metadata': {
                                'name': card.get('name', ''),
                                'position': card.get('position', ''),
                                'overall': card.get('overall', 0),
                                'pac': card.get('pac', 0),
                                'sho': card.get('sho', 0),
                                'pas': card.get('pas', 0),
                                'dri': card.get('dri', 0),
                                'def': card.get('def', 0),
                                'phy': card.get('phy', 0)
                            }
                        })
                    except Exception as e:
                        print(f"Error loading card image: {e}")
        
        return jsonify({
            'success': True,
            'cards': result_cards,
            'total': len(result_cards)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Create output directory if it doesn't exist
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    print("=" * 60)
    print("🎮 FIFA Card Creator Web Server")
    print("=" * 60)
    print(f"🌐 Server running at: http://localhost:5000")
    print(f"📁 Output directory: {os.path.abspath(OUTPUT_DIR)}")
    print(f"📂 Web directory: {os.path.abspath(WEB_DIR)}")
    print("=" * 60)
    print("\n✅ Server is ready! Open http://localhost:5000 in your browser")
    print("⚠️  Press CTRL+C to stop the server\n")
    
    # Run the server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
