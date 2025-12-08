"""
أمثلة عملية لإنشاء بطاقات FIFA
Practical Examples for Creating FIFA Cards
"""

from resources.player import Player
from cardcreator import render_card

def example_1_mohamed_salah():
    """مثال 1: محمد صلاح - ليفربول"""
    print("🎮 إنشاء بطاقة محمد صلاح...")
    
    player = Player(
        name="SALAH",
        pos="RW",               # جناح أيمن
        club="10",              # ليفربول
        country="eg",           # مصر
        overall=90,
        pac=93,
        dri=90,
        sho=87,
        deff=45,
        pas=81,
        phy=75,
        language='EN'
    )
    
    output = render_card(player, "TOTY", None, False, "salah_toty")
    print(f"✅ تم الحفظ في: {output}\n")


def example_2_cristiano_ronaldo():
    """مثال 2: كريستيانو رونالدو - النصر"""
    print("🎮 إنشاء بطاقة كريستيانو رونالدو...")
    
    player = Player(
        name="RONALDO",
        pos="ST",               # مهاجم
        club="112883",          # النصر السعودي
        country="pt",           # البرتغال
        overall=99,
        pac=91,
        dri=89,
        sho=95,
        deff=35,
        pas=82,
        phy=78,
        language='EN'
    )
    
    output = render_card(player, "ICON", None, False, "ronaldo_icon")
    print(f"✅ تم الحفظ في: {output}\n")


def example_3_hakim_ziyech():
    """مثال 3: حكيم زياش - المغرب"""
    print("🎮 إنشاء بطاقة حكيم زياش...")
    
    player = Player(
        name="ZIYECH",
        pos="RW",               # جناح أيمن
        club="5",               # تشيلسي
        country="ma",           # المغرب
        overall=84,
        pac=82,
        dri=85,
        sho=79,
        deff=36,
        pas=83,
        phy=63,
        language='EN'
    )
    
    output = render_card(player, "IF_GOLD", None, False, "ziyech_if")
    print(f"✅ تم الحفظ في: {output}\n")


def example_4_riyad_mahrez():
    """مثال 4: رياض محرز - الجزائر"""
    print("🎮 إنشاء بطاقة رياض محرز...")
    
    player = Player(
        name="MAHREZ",
        pos="RW",               # جناح أيمن
        club="10",              # مانشستر سيتي
        country="dz",           # الجزائر
        overall=86,
        pac=84,
        dri=90,
        sho=80,
        deff=31,
        pas=80,
        phy=65,
        language='EN'
    )
    
    output = render_card(player, "MOTM", None, False, "mahrez_motm")
    print(f"✅ تم الحفظ في: {output}\n")


def example_5_karim_benzema():
    """مثال 5: كريم بنزيما - الاتحاد"""
    print("🎮 إنشاء بطاقة كريم بنزيما...")
    
    player = Player(
        name="BENZEMA",
        pos="ST",               # مهاجم
        club="112879",          # الاتحاد السعودي
        country="fr",           # فرنسا
        overall=91,
        pac=79,
        dri=87,
        sho=90,
        deff=39,
        pas=83,
        phy=78,
        language='EN'
    )
    
    output = render_card(player, "TOTS", None, False, "benzema_tots")
    print(f"✅ تم الحفظ في: {output}\n")


def example_6_sadio_mane():
    """مثال 6: ساديو ماني - النصر"""
    print("🎮 إنشاء بطاقة ساديو ماني...")
    
    player = Player(
        name="MANE",
        pos="LW",               # جناح أيسر
        club="112883",          # النصر
        country="sn",           # السنغال
        overall=89,
        pac=94,
        dri=89,
        sho=83,
        deff=44,
        pas=80,
        phy=76,
        language='EN'
    )
    
    output = render_card(player, "UCL_RARE", None, False, "mane_ucl")
    print(f"✅ تم الحفظ في: {output}\n")


def example_7_custom_player():
    """مثال 7: لاعب مخصص"""
    print("🎮 إنشاء بطاقة لاعب مخصص...")
    
    # يمكنك تغيير هذه القيم كما تريد
    player = Player(
        name="YOUR NAME",       # ضع اسمك هنا
        pos="CAM",              # صانع ألعاب
        club="243",             # ريال مدريد
        country="sa",           # السعودية (غيّرها كما تريد)
        overall=99,
        pac=99,
        dri=99,
        sho=99,
        deff=99,
        pas=99,
        phy=99,
        language='EN'
    )
    
    output = render_card(player, "HERO", None, False, "custom_hero")
    print(f"✅ تم الحفظ في: {output}\n")


def create_team_cards():
    """إنشاء بطاقات لفريق كامل"""
    print("🎮 إنشاء بطاقات فريق ليفربول...")
    
    team = [
        ("SALAH", "RW", "eg", 90, 93, 90, 87),
        ("MANE", "LW", "sn", 89, 94, 89, 83),
        ("FIRMINO", "CF", "br", 87, 76, 86, 80),
        ("VAN DIJK", "CB", "nl", 90, 77, 72, 60),
        ("ALISSON", "GK", "br", 90, 10, 10, 10),
    ]
    
    for name, pos, country, overall, pac, dri, sho in team:
        player = Player(
            name=name,
            pos=pos,
            club="10",          # ليفربول
            country=country,
            overall=overall,
            pac=pac,
            dri=dri,
            sho=sho,
            deff=70 if pos == "CB" else 45,
            pas=80,
            phy=75,
            language='EN'
        )
        
        output = render_card(player, "RARE_GOLD", None, False, f"{name.lower()}_liverpool")
        print(f"✅ {name}: {output}")
    
    print("\n✅ تم إنشاء جميع بطاقات الفريق!\n")


def menu():
    """قائمة الأمثلة"""
    print("=" * 60)
    print("🎮 أمثلة بطاقات FIFA Ultimate Team")
    print("=" * 60)
    print("\n اختر مثالاً لتشغيله:")
    print("\n 1️⃣  محمد صلاح (مصر - ليفربول)")
    print(" 2️⃣  كريستيانو رونالدو (البرتغال - النصر)")
    print(" 3️⃣  حكيم زياش (المغرب - تشيلسي)")
    print(" 4️⃣  رياض محرز (الجزائر - مانشستر سيتي)")
    print(" 5️⃣  كريم بنزيما (فرنسا - الاتحاد)")
    print(" 6️⃣  ساديو ماني (السنغال - النصر)")
    print(" 7️⃣  لاعب مخصص (أنت!)")
    print(" 8️⃣  فريق كامل (ليفربول)")
    print(" 9️⃣  تشغيل جميع الأمثلة")
    print(" 0️⃣  خروج")
    print("\n" + "=" * 60)
    
    choice = input("\n👉 أدخل رقم الخيار: ").strip()
    
    if choice == "1":
        example_1_mohamed_salah()
    elif choice == "2":
        example_2_cristiano_ronaldo()
    elif choice == "3":
        example_3_hakim_ziyech()
    elif choice == "4":
        example_4_riyad_mahrez()
    elif choice == "5":
        example_5_karim_benzema()
    elif choice == "6":
        example_6_sadio_mane()
    elif choice == "7":
        example_7_custom_player()
    elif choice == "8":
        create_team_cards()
    elif choice == "9":
        print("\n🚀 تشغيل جميع الأمثلة...\n")
        example_1_mohamed_salah()
        example_2_cristiano_ronaldo()
        example_3_hakim_ziyech()
        example_4_riyad_mahrez()
        example_5_karim_benzema()
        example_6_sadio_mane()
        example_7_custom_player()
        create_team_cards()
        print("✅ تم الانتهاء من جميع الأمثلة!")
    elif choice == "0":
        print("\n👋 وداعاً!")
        return
    else:
        print("\n❌ خيار غير صحيح! حاول مرة أخرى.\n")
        menu()
    
    # السؤال عن الاستمرار
    again = input("\n❓ هل تريد تجربة مثال آخر؟ (y/n): ").strip().lower()
    if again == "y" or again == "yes" or again == "نعم":
        menu()
    else:
        print("\n✅ تم حفظ جميع البطاقات في مجلد: finished-fut-cards\\")
        print("👋 وداعاً!\n")


if __name__ == "__main__":
    try:
        menu()
    except KeyboardInterrupt:
        print("\n\n👋 تم الإلغاء. وداعاً!")
    except Exception as e:
        print(f"\n❌ خطأ: {str(e)}")
        print("\n💡 تأكد من تثبيت المكتبات المطلوبة:")
        print("   python -m pip install -r requirements.txt")
