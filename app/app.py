from flask import Flask, jsonify, render_template, request, session, redirect, url_for
import random
import string
import math
import os
import generate
from flask import jsonify
app = Flask(__name__,static_url_path='')
app.config['SECRET_KEY']=os.urandom(24)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')


@app.route('/show_passwd/', methods=['GET', 'POST'])
def show_passwd():
    rem_name = request.form.get('rem_name')
    length = request.form.get('length')
    key = request.form.get('key')
    password = generate.passwd(rem_name, length, key)
    password.genhash()
    result = password.random_choose()
    result = ''.join(result)
    return render_template('result.html', result=result)
    # return ''.join(result)
    # return 'hello'
    
@app.route('/genPass/', methods=['GET'])
def genPass():
    rem_name = request.form.get('rem_name')
    length = request.form.get('length')
    key = request.form.get('key')
    password = generate.passwd(rem_name, length, key)
    password.genhash()
    result = password.random_choose()
    result = ''.join(result)
    return result

@app.route("/get_my_ip", methods=["GET"])
def get_my_ip():
    return jsonify({'ip': request.remote_addr}), 200


if __name__ == '__main__':
    app.run()
