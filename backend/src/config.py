import base64


server_address = "127.0.0.1"
server_port = 4000
server_verbose = True

database_name = "SafeQ_Database.db"
database_location = "E:\\Database"

drive_location = "E:\\Drive"
drive_thumbnails = "E:\\Thumbnails" #TODO: check_path

TEST_KEY_BASE64 = "SOGbOtbmNP/XZOuwh/D1V4UK17lgBdsA9TnpMuPY2b4="
TEST_KEY_BYTES = base64.b64decode(TEST_KEY_BASE64)

JWT_SECRET_KEY = "your-secret-key-here"
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30