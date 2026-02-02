import random
import string
import math
import os
import generate

def genPass(rem_name, length, key):
    password = generate.passwd(rem_name, length, key)
    password.genhash()
    result = password.random_choose()
    result = ''.join(result)
    return result

if __name__ == "__main__":
    rem_name = "steam"
    length = 16
    key = "dsm980220"

    print(genPass(rem_name, length, key))
