from PIL import Image
import sys

# 在根目录中添加适当大小的图标文件（icon16.png、icon48.png和icon128.png），用作扩展的图标。
def resize_image(image, size):
    resized_image = image.resize(size)
    return resized_image

def save_image(image, filename):
    image.save(filename, "PNG")

def convert_image(input_file):
    try:
        image = Image.open(input_file)
        icon16 = resize_image(image, (16, 16))
        icon48 = resize_image(image, (48, 48))
        icon128 = resize_image(image, (128, 128))

        save_image(icon16, "icon16.png")
        save_image(icon48, "icon48.png")
        save_image(icon128, "icon128.png")

        print("Conversion completed successfully.")
    except Exception as e:
        print("An error occurred during conversion:", str(e))

# 命令行 python icon.py icon.png, 修改图片的大小为16x16,48x48,128x128
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the input image file as a command line argument.")
    else:
        input_file = sys.argv[1]
        convert_image(input_file)