import os
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter

from resources.cardcode_to_card import cardcode_to_card
from resources.exceptions import *
from resources.languages_dictionary import languages_dict


def render_card(player, card_code, player_image_url, dynamic_img_fl, status_id):
    card_obj = cardcode_to_card.get(card_code.upper())

    if card_obj is None:
        raise InvalidCardCodeError(f'Card code ({card_code}) is invalid.')
    
    card_background = card_obj.background_image_dir
    font_colour_top = card_obj.font_colour_tuple[0]
    font_colour_bottom = card_obj.font_colour_tuple[1]
    fonts_tuple = card_obj.fonts_tuple

    card_bg_img = Image.open(card_background).convert('RGBA')
    draw = ImageDraw.Draw(card_bg_img)

    # prepare fonts ready for use
    overall_font = ImageFont.truetype(fonts_tuple[0][0], fonts_tuple[0][1])
    position_font = ImageFont.truetype(fonts_tuple[1][0], fonts_tuple[1][1])
    name_font = ImageFont.truetype(fonts_tuple[2][0], fonts_tuple[2][1])
    attribute_value_font = ImageFont.truetype(fonts_tuple[3][0], fonts_tuple[3][1])
    attribute_label_font = ImageFont.truetype(fonts_tuple[4][0], fonts_tuple[4][1])

    # Use textbbox instead of textsize for newer Pillow versions
    bbox = draw.textbbox((0, 0), player.name, name_font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    bbox2 = draw.textbbox((0, 0), player.position.name, position_font)
    w2, h2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]

    player_name_left_margin = (card_bg_img.width - w) / 3
    player_position_left_margin = card_obj.dimensions.left_margin + 50 - (w2 / 2)

    add_player_attributes_section(draw, card_obj, font_colour_bottom, player, attribute_value_font, attribute_label_font)

    add_separator_lines(draw, card_obj, font_colour_top, font_colour_bottom)

    if player_image_url is not None:
        temp_path = 'temp'
        if not os.path.exists(temp_path):
            os.makedirs(temp_path)

        temp_filename = f'{status_id}.png'
        temp_file_path = os.path.join(temp_path, temp_filename)

        # Check if it's a local file path or URL
        if os.path.isfile(player_image_url):
            # It's a local file, copy it
            try:
                i = Image.open(player_image_url)
                i.save(temp_file_path)
            except Exception as e:
                print(f"Error loading local image: {str(e)}")
                # If fails, skip image processing
                player_image_url = None
        else:
            # It's a URL, download it
            try:
                request = requests.get(player_image_url, stream=True)
                if request.status_code == 200:
                    # read data from downloaded bytes and returns a PIL.Image.Image object
                    i = Image.open(BytesIO(request.content))
                    # Saves the image under the given filename
                    i.save(temp_file_path)
                else:
                    player_image_url = None
            except Exception as e:
                print(f"Error downloading image: {str(e)}")
                player_image_url = None

        if player_image_url is not None:
            if dynamic_img_fl:
                card_bg_img = stamp_dynamic_player_image(card_bg_img, card_obj, temp_file_path, status_id)
                draw = ImageDraw.Draw(card_bg_img)
            else:
                stamp_player_image(card_bg_img, card_obj, temp_file_path)

    add_player_name_overall_and_position(draw, card_obj, font_colour_top, font_colour_bottom, player_name_left_margin,
                                         player_position_left_margin, player, name_font, overall_font, position_font)

    stamp_country_flag_and_club_badge(card_obj, card_bg_img, player)

    save_path = 'finished-fut-cards'
    if not os.path.exists(save_path):
        os.makedirs(save_path)

    save_filename = f'{status_id}.png'
    output_file_path = os.path.join(save_path, save_filename)
    card_bg_img.save(output_file_path)
    return output_file_path


def stamp_player_image(card_bg_img, card_obj, player_image_filename):
    """
    دالة محسّنة لإضافة صورة اللاعب على البطاقة
    تتعامل مع الخلفية البيضاء والشفافية بشكل أفضل
    Improved function to add player image to card
    Better handling of white backgrounds and transparency
    """
    player_img = Image.open(player_image_filename).convert('RGBA')
    
    # تطبيق فلتر خفيف لتنعيم الحواف
    # Apply light filter to smooth edges
    player_img = player_img.filter(ImageFilter.SMOOTH_MORE)
    
    # الطريقة المحسّنة لإزالة الخلفية البيضاء/الفاتحة
    # Improved method for removing white/light backgrounds
    datas = player_img.getdata()
    newData = []
    
    for item in datas:
        # تحسين عملية الكشف عن الخلفية البيضاء
        # Improved white background detection
        r, g, b, a = item[0], item[1], item[2], item[3] if len(item) == 4 else 255
        
        # حساب مدى قرب اللون من الأبيض
        # Calculate how close the color is to white
        white_distance = abs(r - 255) + abs(g - 255) + abs(b - 255)
        
        # إذا كان اللون قريب جداً من الأبيض (مجموع الفرق أقل من 30)
        # If color is very close to white (sum of difference less than 30)
        if white_distance < 30:
            # نجعله شفاف تماماً
            # Make it completely transparent
            newData.append((255, 255, 255, 0))
        # إذا كان قريب من الأبيض (30-60) - شفافية تدريجية
        # If close to white (30-60) - gradual transparency
        elif white_distance < 60:
            # نقلل الشفافية تدريجياً
            # Gradually reduce opacity
            new_alpha = int((white_distance / 60) * 255)
            newData.append((r, g, b, new_alpha))
        else:
            # نحتفظ بالبكسل كما هو
            # Keep pixel as is
            newData.append((r, g, b, a))
    
    player_img.putdata(newData)
    
    # حساب الحجم المناسب مع الحفاظ على نسبة الأبعاد
    # Calculate appropriate size while maintaining aspect ratio
    original_width, original_height = player_img.size
    
    # الحجم المطلوب للصورة على البطاقة
    # Target size for image on card
    target_height = 380
    aspect_ratio = original_width / original_height
    target_width = int(target_height * aspect_ratio)
    
    # إذا كان العرض كبير جداً، نعدل بناءً على العرض
    # If width is too large, adjust based on width
    max_width = 420
    if target_width > max_width:
        target_width = max_width
        target_height = int(target_width / aspect_ratio)
    
    # تغيير حجم الصورة مع الحفاظ على الجودة
    # Resize image while maintaining quality
    player_img = player_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # حساب الموضع المثالي للصورة
    # Calculate ideal position for image
    # نضع الصورة في المنتصف أفقياً
    # Center image horizontally
    x_position = (card_bg_img.width - player_img.width) // 2 + 50
    
    # الموضع العمودي - بين التقييم والاسم
    # Vertical position - between rating and name
    y_position = 57
    
    # لصق الصورة مع الحفاظ على الشفافية
    # Paste image while preserving transparency
    card_bg_img.paste(player_img, (x_position, y_position), player_img)


def stamp_dynamic_player_image(card_bg_img, card_obj, player_image_filename, status_id):
    player_img = Image.open(player_image_filename).convert('RGBA')

    dynamic_img_path = paste_dynamic_player_image_on_blank_canvas(card_bg_img, card_obj, player_img, status_id)
    dynamic_player_img = Image.open(dynamic_img_path)

    final = Image.new("RGBA", card_bg_img.size)
    final = Image.alpha_composite(final, card_bg_img)
    final = Image.alpha_composite(final, dynamic_player_img)

    return final


def paste_dynamic_player_image_on_blank_canvas(card_bg_img, card_obj, player_img, status_id):
    canvas = Image.new("RGBA", card_bg_img.size)
    canvas.paste(player_img, (card_obj.dimensions.left_margin_dynamic_player_image,
                              card_bg_img.height - player_img.height - card_obj.dimensions.bottom_margin_dynamic_player_image),
                 player_img)
    canvas.save('canvas.png')
    tmp_save_path = 'temp'
    if not os.path.exists(tmp_save_path):
        os.makedirs(tmp_save_path)
    save_filename = f'dynamic-img-{status_id}.png'
    tmp_file_path = os.path.join(tmp_save_path, save_filename)
    canvas.save(tmp_file_path)

    return tmp_file_path


def stamp_country_flag_and_club_badge(card_obj, card_bg_img, player):
    try:
        country_flag_img = Image.open(f"assets/nations/png100px/{player.country}.png").convert('RGBA')
    except FileNotFoundError:
        raise InvalidCountryCodeError(f'Country code ({player.country}) is invalid.')

    country_flag_img_width = 166
    country_flag_img_height = 99
    country_flag_img_width = int(country_flag_img_width * 0.48)
    country_flag_img_height = int(country_flag_img_height * 0.48)
    country_flag_img = country_flag_img.resize((country_flag_img_width, country_flag_img_height))

    try:
        club_badge_img = Image.open(f"assets/clubs/{player.club}.png").convert('RGBA')
    except FileNotFoundError:
        raise InvalidClubNumberError(f'Club number ({player.club}) is invalid.')

    club_badge_img_width, club_badge_img_height = club_badge_img.size
    club_badge_img_width = int(club_badge_img_width * 0.55)
    club_badge_img_height = int(club_badge_img_height * 0.55)
    club_badge_img = club_badge_img.resize((club_badge_img_width, club_badge_img_height), Image.LANCZOS)

    # paste the country flag and club badge
    card_bg_img.paste(country_flag_img, (card_obj.dimensions.left_margin + 10, 272), country_flag_img)
    card_bg_img.paste(club_badge_img, (card_obj.dimensions.left_margin_club_badge, 350), club_badge_img)


def add_player_attributes_section(draw, card_obj, font_colour, player, attribute_value_font, attribute_label_font):
    language_code = player.language.name

    atr1_label = languages_dict.get(language_code).get('attribute_labels')[0]
    atr2_label = languages_dict.get(language_code).get('attribute_labels')[1]
    atr3_label = languages_dict.get(language_code).get('attribute_labels')[2]
    atr4_label = languages_dict.get(language_code).get('attribute_labels')[3]
    atr5_label = languages_dict.get(language_code).get('attribute_labels')[4]
    atr6_label = languages_dict.get(language_code).get('attribute_labels')[5]

    '''
    Draw the first column of stats and labels
    '''
    # PAC attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col1, card_obj.dimensions.top_margin_stats_row_1_values), str(player.pac), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col1, card_obj.dimensions.top_margin_stats_row_1_labels), atr1_label, fill=font_colour, font=attribute_label_font)
    # SHO attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col1, card_obj.dimensions.top_margin_stats_row_2_values), str(player.sho), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col1, card_obj.dimensions.top_margin_stats_row_2_labels), atr3_label, fill=font_colour, font=attribute_label_font)
    # PAS attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col1, card_obj.dimensions.top_margin_stats_row_3_values), str(player.pas), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col1, card_obj.dimensions.top_margin_stats_row_3_labels), atr5_label, fill=font_colour, font=attribute_label_font)

    '''
    Draw the second column of stats and labels
    '''
    # DRI attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col2, card_obj.dimensions.top_margin_stats_row_1_values), str(player.dri), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col2, card_obj.dimensions.top_margin_stats_row_1_labels), atr2_label, fill=font_colour, font=attribute_label_font)
    # DEF attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col2, card_obj.dimensions.top_margin_stats_row_2_values), str(player.deff), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col2, card_obj.dimensions.top_margin_stats_row_2_labels), atr4_label, fill=font_colour, font=attribute_label_font)
    # PHY attr and label
    draw.text((card_obj.dimensions.left_margin_attr_value_col2, card_obj.dimensions.top_margin_stats_row_3_values), str(player.phy), fill=font_colour,
              font=attribute_value_font)
    draw.text((card_obj.dimensions.left_margin_attr_label_col2, card_obj.dimensions.top_margin_stats_row_3_labels), atr6_label, fill=font_colour, font=attribute_label_font)


def add_player_name_overall_and_position(draw, card_obj, font_colour_top, font_colour_bottom, player_name_left_margin, player_position_left_margin,
                                         player, namefont, overallfont, positionfont):
    # add player name
    draw.text((player_name_left_margin, card_obj.dimensions.top_margin_name), player.name.upper(), fill=font_colour_bottom, font=namefont)
    # add player overall rating
    draw.text((card_obj.dimensions.left_margin_overall, card_obj.dimensions.top_margin_player_overall), str(player.overall), fill=font_colour_top, font=overallfont)
    # add player position
    draw.text((player_position_left_margin, card_obj.dimensions.top_margin_position), player.position.name, fill=font_colour_top, font=positionfont)


def add_separator_lines(draw, card_obj, font_colour_top, font_colour_bottom):
    LINE_WIDTH = 1

    # draw line under position
    draw.line((card_obj.dimensions.left_point_x_coordinate_line_under_position, card_obj.dimensions.top_margin_line_under_position,
               card_obj.dimensions.right_point_x_coordinate_line_under_position, card_obj.dimensions.top_margin_line_under_position),
              fill=font_colour_top, width=LINE_WIDTH)

    # draw line under country flag
    draw.line((card_obj.dimensions.left_point_x_coordinate_line_under_position, card_obj.dimensions.top_margin_line_under_country_flag,
               card_obj.dimensions.right_point_x_coordinate_line_under_position, card_obj.dimensions.top_margin_line_under_country_flag),
              fill=font_colour_top, width=LINE_WIDTH)

    # draw line under name
    draw.line((card_obj.dimensions.margin_line_under_name, card_obj.dimensions.top_margin_line_under_name,
               draw.im.size[0] - card_obj.dimensions.margin_line_under_name, card_obj.dimensions.top_margin_line_under_name),
              fill=font_colour_bottom, width=LINE_WIDTH)

    # draw line under stats
    draw.line((card_obj.dimensions.margin_line_under_stats, card_obj.dimensions.top_margin_line_under_stats,
               draw.im.size[0] - card_obj.dimensions.margin_line_under_stats, card_obj.dimensions.top_margin_line_under_stats),
              fill=font_colour_bottom, width=LINE_WIDTH)

    # draw vertical line between stats columns
    draw.line(((draw.im.size[0] / 2), card_obj.dimensions.top_margin_vertical_line_between_stats_columns,
               (draw.im.size[0] / 2), card_obj.dimensions.bottom_point_vertical_line_between_stats_columns),
              fill=font_colour_bottom, width=LINE_WIDTH)

              
