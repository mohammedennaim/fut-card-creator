"""
Add random FIFA ratings to all existing cards in the database
This is for testing the formation planner's rating display
"""

import json
import random
import os

DATABASE_FILE = 'cards_database.json'

def generate_random_rating(base_rating=75):
    """Generate a random rating around a base value"""
    return random.randint(max(40, base_rating - 15), min(99, base_rating + 15))

def add_ratings_to_cards():
    """Add random ratings to all cards that don't have them"""
    
    # Load database
    if not os.path.exists(DATABASE_FILE):
        print(f"❌ Database file not found: {DATABASE_FILE}")
        print("Creating new database...")
        db = {'cards': []}
    else:
        with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
            db = json.load(f)
    
    if not db.get('cards'):
        print("❌ No cards found in database!")
        return
    
    print(f"📊 Found {len(db['cards'])} cards in database\n")
    
    updated_count = 0
    
    for card in db['cards']:
        # Generate random overall rating if missing or 0
        if not card.get('overall') or card.get('overall') == 0:
            card['overall'] = random.randint(75, 94)
        
        base = card['overall']
        
        # Add random stats if missing
        if not card.get('pac') or card.get('pac') == 0:
            card['pac'] = generate_random_rating(base)
        if not card.get('sho') or card.get('sho') == 0:
            card['sho'] = generate_random_rating(base)
        if not card.get('pas') or card.get('pas') == 0:
            card['pas'] = generate_random_rating(base)
        if not card.get('dri') or card.get('dri') == 0:
            card['dri'] = generate_random_rating(base)
        if not card.get('def') or card.get('def') == 0:
            card['def'] = generate_random_rating(base)
        if not card.get('phy') or card.get('phy') == 0:
            card['phy'] = generate_random_rating(base)
        
        # Add position if missing
        if not card.get('position'):
            positions = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']
            card['position'] = random.choice(positions)
        
        updated_count += 1
        
        # Print card info
        print(f"✅ {card.get('name', 'Unknown')}")
        print(f"   Overall: {card['overall']} | Position: {card['position']}")
        print(f"   PAC:{card['pac']} SHO:{card['sho']} PAS:{card['pas']} DRI:{card['dri']} DEF:{card['def']} PHY:{card['phy']}")
        print()
    
    # Save updated database
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 SUCCESS! Updated {updated_count} cards with random ratings!")
    print(f"💾 Database saved to: {DATABASE_FILE}")
    print("\n✨ Your cards now have ratings for testing the formation planner!")
    print("\n🚀 Refresh your Formation Planner to see the ratings!")

if __name__ == '__main__':
    print("=" * 60)
    print("🎮 FIFA CARD RATING GENERATOR")
    print("=" * 60)
    print("\nAdding random ratings to all cards...\n")
    
    add_ratings_to_cards()
    
    print("\n" + "=" * 60)
    input("\nPress Enter to close...")
