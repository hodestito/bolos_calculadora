from app import app, mongo
from bson import Binary, Code
from bson.json_util import dumps
from bson.objectid import ObjectId
from flask import jsonify, request
from flask_cors import CORS, cross_origin
from subprocess import Popen, PIPE
import os

cors = CORS(app)

#@app.route('/produtos', methods=['POST'])
# def add_user():
#	_json = request.json
#	_id = _json['id']
#	_nome = _json['nome']
#	_unidades = _json['unidades']
#	_unidadecusto = _json['unidadecusto']
#	_valorcusto = _json['valorcusto']
#	_custounitario = _json['custounitario']
#	# validate the received values
#	if _id and _nome and _unidades and _unidadecusto and _valorcusto and _custounitario and request.method == 'POST':
#		# save details
#		id = mongo.db.produto.insert_one(
#			{'id': _id, 'nome': _nome, 'unidades': _unidades, 'unidadecusto': _unidadecusto,
#			 'valorcusto': _valorcusto, 'custounitario': _custounitario}
#		)
#		print(id)
#		resp = jsonify('Produto adicionado com sucesso!')
#		resp.status_code = 200
#		return resp
#	else:
#		return not_found()
		
@app.route('/produtos', methods=['GET'])
@cross_origin()
def produtos():
	produtos = mongo.db.produto.find()
	resp = dumps(produtos)
	return resp

@app.route('/produtos/<id>', methods=['GET'])
@cross_origin()
def produto(id):
	produto = mongo.db.produto.find_one({'id': id})
	resp = dumps(produto)
	return resp

#@app.route('/produtos', methods=['PUT'])
# def update_user():
#	_json = request.json
#	_id = _json['_id']
#	_nome = _json['nome']
#	_unidades = _json['unidades']
#	_unidadecusto = _json['unidadecusto']
#	_valorcusto = _json['valorcusto']
#	_custounitario = _json['custounitario']
#	# validate the received values
#	if _id and _nome and _unidades and _unidadecusto and _valorcusto and _custounitario and _id and request.method == 'PUT':
#		# save edits
#		mongo.db.produto.update_one(
#			{'_id': _id if '_id' in _id else ObjectId(_id)},
#		 	{'$set': {'nome': _nome, 'unidades': _unidades, 'unidadecusto': _unidadecusto,
#			 'valorcusto': _valorcusto, 'custounitario': _custounitario}}
#		)
#		resp = jsonify('Produto atualizado com sucesso!')
#		resp.status_code = 200
#		return resp
#	else:
#		return not_found()
		
#@app.route('/produtos/<id>', methods=['DELETE'])
# def delete_user(id):
#	mongo.db.produto.delete_one({'_id': ObjectId(id)})
#	resp = jsonify('Produto deleted successfully!')
#	resp.status_code = 200
#	return resp
		
@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url,
    }
    resp = jsonify(message)
    resp.status_code = 404

    return resp

if __name__ == "__main__":
    #p = Popen(['python server.py'], shell=True, stdout=PIPE, stderr=PIPE)
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)