import os
path = r"C:\Users\Akash Singh\.gradle\caches\9.3.1\transforms\63665759bc44fa5b83dd6b6c18b77145\workspace\transformed\react-android-0.86.3-debug\prefab\modules\reactnative\include\react\renderer\core\graphicsConversions.h"
with open(path, "r", encoding="utf-8") as f:
    text = f.read()

target = 'return std::format("{}%", dimension.value);'
replacement = '''      std::string str = std::to_string(dimension.value);
      // Remove trailing zeros and decimal point if it's a whole number
      str.erase(str.find_last_not_of('0') + 1, std::string::npos);
      if (str.back() == '.') str.pop_back();
      return str + "%";'''

if target in text:
    text = text.replace(target, replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Patched successfully")
else:
    print("Target not found (maybe already patched)")
