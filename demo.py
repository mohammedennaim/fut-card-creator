"""
ملف تجريبي لإنشاء بطاقة FIFA Ultimate Team
Demo file to create a FIFA Ultimate Team card
"""

from resources.player import Player
from cardcreator import render_card

def create_sample_card():
    """إنشاء بطاقة تجريبية - Create a sample card"""
    
    print("🎮 مرحباً بك في منشئ بطاقات FIFA Ultimate Team!")
    print("🎮 Welcome to FIFA Ultimate Team Card Creator!\n")
    
    # إنشاء لاعب تجريبي - Create a sample player
    # [Name, Position, Club, Country, Overall, PAC, DRI, SHO, DEF, PAS, PHY]
    player = Player(
        name="MESSI",
        pos="RW",           # Right Wing - جناح أيمن
        club="241",         # FC Barcelona
        country="ar",       # Argentina - الأرجنتين
        overall=94,
        pac=92,
        dri=95,
        sho=88,
        deff=24,
        pas=86,
        phy=62,
        language='EN'
    )
    
    print(f"📝 إنشاء بطاقة للاعب: {player.name}")
    print(f"📝 Creating card for player: {player.name}")
    print(f"   المركز | Position: {player.position.name}")
    print(f"   التقييم العام | Overall: {player.overall}\n")
      # إنشاء البطاقة - Create the card
    card_code = "RARE_GOLD"  # يمكن استخدام: IF_GOLD, MOTM, TOTY, etc.
    player_image_url = None  # لا نستخدم صورة الآن - No image for now
    dynamic_img_fl = False
    status_id = "demo_001"
    
    try:
        print("🎨 جاري إنشاء البطاقة...")
        print("🎨 Creating card...\n")
        
        output_file_path = render_card(player, card_code, player_image_url, dynamic_img_fl, status_id)
        
        print(f"✅ تم إنشاء البطاقة بنجاح!")
        print(f"✅ Card created successfully!")
        print(f"📁 الملف: {output_file_path}\n")
        
        # عرض معلومات إضافية - Display additional info
        print("=" * 50)
        print("💡 لإنشاء بطاقة مخصصة، قم بتعديل المعلومات في ملف demo.py")
        print("💡 To create a custom card, edit the info in demo.py")
        print("=" * 50)
        print("\n🎯 أنواع البطاقات المتاحة | Available card types:")
        print("   - RARE_GOLD")
        print("   - IF_GOLD (In-Form)")
        print("   - MOTM (Man of the Match)")
        print("   - TOTY (Team of the Year)")
        print("   - UCL_COMMON")
        print("   - والمزيد... | and more...")
        
    except Exception as e:
        print(f"❌ خطأ: {str(e)}")
        print(f"❌ Error: {str(e)}")
        print("\n💡 تأكد من تثبيت جميع المكتبات المطلوبة:")
        print("   python -m pip install -r requirements.txt")

if __name__ == "__main__":
    create_sample_card()
