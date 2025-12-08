"""
Create sample FIFA cards with random ratings for testing
"""

import json
import random
import os
import glob

DATABASE_FILE = 'cards_database.json'

# Sample player names for testing
PLAYER_NAMES = [
    'Cristiano Ronaldo', 'Lionel Messi', 'Neymar Jr', 'Kylian Mbappé',
    'Mohamed Salah', 'Kevin De Bruyne', 'Robert Lewandowski', 'Sadio Mané',
    'Sergio Ramos', 'Virgil van Dijk', 'Manuel Neuer', 'Luka Modrić',
    'Karim Benzema', 'Erling Haaland', 'Son Heung-min', 'Bruno Fernandes',
    'Paul Pogba', 'Toni Kroos', 'Casemiro', 'Joshua Kimmich'
]

POSITIONS = ['ST', 'CF', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']
CARD_TYPES = ['GOLD', 'RARE', 'ICON', 'TOTS', 'TOTY']
CLUBS = ['Real Madrid', 'Barcelona', 'Liverpool', 'Manchester City', 'PSG', 'Bayern Munich']
COUNTRIES = ['Portugal', 'Argentina', 'Brazil', 'France', 'Egypt', 'Germany', 'Spain', 'England']

def create_sample_database():
    """Create a database with sample cards"""
    
    # Get existing card images
    card_images = glob.glob('finished-fut-cards/web_*.png')
    
    print(f"📸 Found {len(card_images)} card images\n")
    
    cards = []
    
    # Create cards based on images
    for i, img_path in enumerate(card_images[:20]):  # Limit to 20 cards
        filename = os.path.basename(img_path)
        card_id = filename.replace('web_', '').replace('.png', '')
        
        # Random player data
        overall = random.randint(75, 95)
        position = random.choice(POSITIONS)
        
        # Adjust stats based on position
        if position == 'GK':
            pac = random.randint(40, 60)
            sho = random.randint(40, 60)
            pas = random.randint(50, 70)
            dri = random.randint(40, 60)
            defend = random.randint(60, 90)
            phy = random.randint(70, 90)
        elif position in ['CB', 'LB', 'RB']:
            pac = random.randint(60, 85)
            sho = random.randint(40, 70)
            pas = random.randint(60, 80)
            dri = random.randint(50, 75)
            defend = random.randint(75, 92)
            phy = random.randint(70, 90)
        elif position in ['CDM', 'CM']:
            pac = random.randint(65, 85)
            sho = random.randint(60, 85)
            pas = random.randint(75, 92)
            dri = random.randint(70, 88)
            defend = random.randint(60, 80)
            phy = random.randint(65, 85)
        else:  # Attackers
            pac = random.randint(80, 96)
            sho = random.randint(75, 95)
            pas = random.randint(70, 90)
            dri = random.randint(80, 95)
            defend = random.randint(30, 50)
            phy = random.randint(60, 85)
        
        card = {
            'id': card_id,
            'name': PLAYER_NAMES[i % len(PLAYER_NAMES)],
            'position': position,
            'overall': overall,
            'pac': pac,
            'sho': sho,
            'pas': pas,
            'dri': dri,
            'def': defend,
            'phy': phy,
            'club': random.choice(CLUBS),
            'country': random.choice(COUNTRIES),
            'cardType': random.choice(CARD_TYPES),
            'created_at': '2024-12-03T00:00:00',
            'filename': filename,
            'hasImage': True
        }
        
        cards.append(card)
        
        print(f"✅ {card['name']} ({card['position']}) - OVR {card['overall']}")
        print(f"   📊 PAC:{pac} SHO:{sho} PAS:{pas} DRI:{dri} DEF:{defend} PHY:{phy}")
        print(f"   🖼️  {filename}\n")
    
    # Create database structure
    db = {'cards': cards}
    
    # Save to file
    with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    
    print(f"\n🎉 SUCCESS!")
    print(f"💾 Created database with {len(cards)} cards")
    print(f"📁 Saved to: {DATABASE_FILE}")
    print(f"\n✨ All cards have realistic FIFA ratings!")
    print(f"🚀 Your Formation Planner is ready to test!")

if __name__ == '__main__':
    print("=" * 70)
    print("🎮 FIFA CARD DATABASE CREATOR WITH RANDOM RATINGS")
    print("=" * 70)
    print("\nCreating sample cards for testing...\n")
    
    create_sample_database()
    
    print("\n" + "=" * 70)
    print("\n🔥 NEXT STEPS:")
    print("1. Open http://localhost:5000/formation.html")
    print("2. Cards will auto-load with ratings")
    print("3. Drag them to the field to test!")
    print("\n" + "=" * 70)
    input("\nPress Enter to close...")
