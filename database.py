"""
Simple JSON-based database for storing player cards
قاعدة بيانات بسيطة لتخزين بطاقات اللاعبين
"""

import json
import os
from datetime import datetime

DATABASE_FILE = 'cards_database.json'

def load_database():
    """Load database from JSON file"""
    if os.path.exists(DATABASE_FILE):
        try:
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading database: {e}")
            return {'cards': []}
    return {'cards': []}

def save_database(db):
    """Save database to JSON file"""
    try:
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving database: {e}")
        return False

def add_card_to_database(card_id, player_data):
    """
    Add a card to the database
    
    Args:
        card_id (str): Unique card identifier
        player_data (dict): Player stats and info
    
    Returns:
        bool: Success status
    """
    db = load_database()
    
    # Create card entry
    card_entry = {
        'id': card_id,
        'name': player_data.get('name', ''),
        'position': player_data.get('position', ''),
        'overall': player_data.get('overall', 0),
        'pac': player_data.get('pac', 0),
        'sho': player_data.get('sho', 0),
        'pas': player_data.get('pas', 0),
        'dri': player_data.get('dri', 0),
        'def': player_data.get('def', 0),
        'phy': player_data.get('phy', 0),
        'club': player_data.get('club', ''),
        'country': player_data.get('country', ''),
        'cardType': player_data.get('cardType', 'GOLD'),
        'created_at': datetime.now().isoformat(),
        'filename': player_data.get('filename', ''),
        'hasImage': player_data.get('hasImage', False)
    }
    
    # Check if card already exists
    existing_index = None
    for i, card in enumerate(db['cards']):
        if card['id'] == card_id:
            existing_index = i
            break
    
    if existing_index is not None:
        # Update existing card
        db['cards'][existing_index] = card_entry
    else:
        # Add new card
        db['cards'].append(card_entry)
    
    # Save to file
    return save_database(db)

def get_card_by_id(card_id):
    """Get a card by its ID"""
    db = load_database()
    for card in db['cards']:
        if card['id'] == card_id:
            return card
    return None

def get_all_cards():
    """Get all cards from database"""
    db = load_database()
    return db['cards']

def get_random_cards(count=6):
    """Get random cards from database"""
    import random
    db = load_database()
    cards = db['cards']
    
    if len(cards) == 0:
        return []
    
    # If we have fewer cards than requested, return all
    if len(cards) <= count:
        return cards
    
    # Return random selection
    return random.sample(cards, count)

def delete_card(card_id):
    """Delete a card from database"""
    db = load_database()
    db['cards'] = [card for card in db['cards'] if card['id'] != card_id]
    return save_database(db)
