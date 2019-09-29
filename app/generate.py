#!/usr/bin/python
from hashlib import md5
import random

base_str = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
            'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ',', '.', '~',
            '!', '@', '#', '$', '%', '^', '&', '*', ';', ':', '?']


class passwd():

    def __init__(self, rem_name, length, key):
        self.rem_name = rem_name
        self.length = int(length)
        self.key = key

    def genhash(self):
        string = self.rem_name.join(self.key)
        hash_md5 = md5()  # MD5 hash object
        # MD5 encode
        h_md5 = hash_md5.copy()
        h_md5.update(string.encode('utf-8'))  # encode to utf8
        self.md5_str = h_md5.hexdigest()  # get the md5 string
        # print(md5_str)

    def random_choose(self):
        print(self.md5_str)
        result = []
        for i in range(self.length):
            random.seed(self.md5_str[:i])
            index = random.randint(0, len(base_str)-1)
            result.append(base_str[index])
        return result


if __name__ == "__main__":
    # change the keys to your own keys
    keys = 'customized keys'
    password = passwd('qq', 16, keys)
    password.genhash()
    result = password.random_choose()
    print(result)
