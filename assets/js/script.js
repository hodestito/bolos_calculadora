/*
Bootstable
 @description  Javascript library to make HMTL tables editable, using Bootstrap
 @version 1.1
 @autor Tito Hinostroza
*/
"use strict";
//Global variables
var params = null;  		//Parameters
var colsEdi = null;
var newColHtml = '<div class="btn-group">' +
    '<button id="bEdit" type="button" class="btn btn-sm btn-default" onclick="rowEdit(this);">' +
    '<span class="fa fa-pencil" > </span>' +
    '</button>' +
    '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim(this);">' +
    '<span class="fa fa-trash" > </span>' +
    '</button>' +
    '<button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowAcep(this);">' +
    '<span class="fa fa-check" > </span>' +
    '</button>' +
    '<button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;" onclick="rowCancel(this);">' +
    '<span class="fa fa-remove" > </span>' +
    '</button>' +
    '</div>';
var colEdicHtml = '<td name="buttons">' + newColHtml + '</td>';

$.fn.BuscaProdutos = function () {

    //Firebase
    // Inicializar banco de dados
    var db = firebase.firestore();

    //Recuperar todos os registros
    db.collection("produtos").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            //console.log(`${doc.id} => ${doc.data()}`);
            var produto = doc.data();
            //console.log(produto);
            //Object.keys(keys).map(a => console.log(a));
            $("#tbbody").append(
                  '<tr id="' + doc.id + '">'
                + '<td name="nome">' + produto.nome + '</td>'
                + '<td name="quantidade">' + 0 + '</td>'
                + '<td name="select"><select id="un' + doc.id + '" onChange="changeUnidade(value)">'
                + '</select></td>'
                + '<td name="valorcusto">' + numeral(produto.valorcusto).format('0.00') + '</td>'
                + '<td name="unidadecusto">' + produto.unidadecusto + '</td>'
                + '<td name="custounitario">' + numeral(produto.custounitario).format('0.0000') + '</td>'
                + '<td name="valortotal">' + numeral(0).format('0.00') + '</td>'
                + colEdicHtml +
                + '</tr>'
            )
            $.each(doc.data().unidades, function (key, value) {
                $("#un" + doc.id).append(
                    "<option value=" + value + ">" + key + "</option>"
                )
            })
        });
    });

    //carregaDBProdutos(db);
};


$.fn.SetEditable = function (options) {
    var defaults = {
        columnsEd: null,         //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        $addButton: null,        //Jquery object of "Add" button
        onEdit: function () { Recalcular() },   //Called after edition - Recalcular
        onBeforeDelete: function () { }, //Called before deletion
        onDelete: function () { Recalcular() }, //Called after deletion
        onAdd: function () { }     //Called when added a new row
    };
    params = $.extend(defaults, options);
    //this.find('tbody tr').append(colEdicHtml);
    //$("tr").append(colEdicHtml);
    var $tabedi = this;   //Read reference to the current table, to resolve "this" here.
    //console.log($("#tbbody").get(0).rows[1]);
    //$("#tbbody").on("change", function ( ){
    //    $tabedi.find('tbody tr').append(colEdicHtml);
    //});


    //Process "addButton" parameter
    if (params.$addButton != null) {
        //Se proporcionó parámetro
        params.$addButton.click(function () {
            rowAddNew($tabedi.attr("id"));
        });
    }
    //Process "columnsEd" parameter
    if (params.columnsEd != null) {
        //Extract felds
        colsEdi = params.columnsEd.split(',');
    }
};

function Recalcular(){
    console.log("Recalculado!");
    var rows = $("#tbbody").get(0).rows;
    var tcustoprodutos = 0;
    for (let i = 0; i < rows.length; i++) {
        var quantidade = rows[i].cells[1].innerText;
        var unidadeid = rows[i].id;
        var multiplicador = $("#un" + unidadeid + " option:selected").val();
        var custounitario = rows[i].cells[5].innerText;
        var custottotal = quantidade * multiplicador * custounitario
        tcustoprodutos = tcustoprodutos + custottotal;

        //Formata o valor do custo por linha
        rows[i].cells[6].innerText = numeral(custottotal).format("0.00");

        //console.log("Quantidade = " + quantidade 
        //+ " * multiplicador = " + multiplicador 
        //+ " * custounitario = " + custounitario
        //+ " = total = " + custottotal);
    }

    //Atualiza a tabela de totais
    $("#tcustoproduto").get(0).cells[1].innerText = numeral(tcustoprodutos).format("0.00");
    var tcustosadicionais = $("#tcustosadicionais").get(0).cells[1];
    //$("#tcustosadicionais").get(0).cells[1].innerText = numeral(tcustosadicionais).format("0.00");
    console.log(Object.getPrototypeOf(tcustosadicionais));
    var tgastosextras = (tcustoprodutos)*0.3;
    $("#tgastosextras").get(0).cells[1].innerText = numeral(tgastosextras).format("0.00");
    var tcustototal = tcustoprodutos + tgastosextras;
    $("#tcustototal").get(0).cells[1].innerText = numeral(tcustototal).format("0.00");
    var tvalora = tcustototal * 2;
    $("#tvalora").get(0).cells[1].innerText = numeral(tvalora).format("0.00");
    var tvalorb = tcustototal * 3;
    $("#tvalorb").get(0).cells[1].innerText = numeral(tvalorb).format("0.00");
    var tvalorc = tcustototal * 4;
    $("#tvalorc").get(0).cells[1].innerText = numeral(tvalorc).format("0.00");

}

function IterarCamposEdit($cols, tarea) {
    //Itera por los campos editables de una fila
    var n = 0;
    $cols.each(function () {
        n++;
        if ($(this).attr('name') == 'buttons') return;  //excluye columna de botones
//        if ($(this).attr('name') != 'quantidade') return;  //exclui colunas nao alteraveis
        if (!EsEditable(n - 1)) return;   //noe s campo editable
        tarea($(this));
    });

    function EsEditable(idx) {
        //Indica si la columna pasada está configurada para ser editable
        if (colsEdi == null) {  //no se definió
            return true;  //todas son editable
        } else {  //hay filtro de campos
            //alert('verificando: ' + idx);
            for (var i = 0; i < colsEdi.length; i++) {
                if (idx == colsEdi[i]) return true;
            }
            return false;  //no se encontró
        }
    }
}
function changeUnidade(valor) {
    Recalcular();
}
function FijModoNormal(but) {
    $(but).parent().find('#bAcep').hide();
    $(but).parent().find('#bCanc').hide();
    $(but).parent().find('#bEdit').show();
    $(but).parent().find('#bElim').show();
    var $row = $(but).parents('tr');  //accede a la fila
    var id = $row.attr('id');
    $row.attr('id', id.substr(1,id.length));  //quita marca
}
function FijModoEdit(but) {
    $(but).parent().find('#bAcep').show();
    $(but).parent().find('#bCanc').show();
    $(but).parent().find('#bEdit').hide();
    $(but).parent().find('#bElim').hide();
    var $row = $(but).parents('tr');  //accede a la fila
    var id = $row.attr('id');
    $row.attr('id', '/' + id);  //indica que está en edición
}
function ModoEdicion($row) {
    if ($row.attr('id').substr(0,1) == '/') {
        return true;
    } else {
        return false;
    }
}
function rowAcep(but) {
    //Acepta los cambios de la edición
    var $row = $(but).parents('tr');  //accede a la fila
    var $cols = $row.find('td');  //lee campos
    if (!ModoEdicion($row)) return;  //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        var cont = $td.find('input').val(); //lee contenido del input
        $td.html(cont);  //fija contenido y elimina controles
    });
    FijModoNormal(but);
    params.onEdit($row);
}
function rowCancel(but) {
    //Rechaza los cambios de la edición
    var $row = $(but).parents('tr');  //accede a la fila
    var $cols = $row.find('td');  //lee campos
    if (!ModoEdicion($row)) return;  //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        var cont = $td.find('div').html(); //lee contenido del div
        $td.html(cont);  //fija contenido y elimina controles
    });
    FijModoNormal(but);
}
function rowEdit(but) {  //Inicia la edición de una fila
    var $row = $(but).parents('tr');  //accede a la fila
    var $cols = $row.find('td');  //lee campos
    if (ModoEdicion($row)) return;  //Ya está en edición
    //Pone en modo de edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        var cont = $td.html(); //lee contenido
        var div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido
        var input = '<input class="form-control input-sm"  value="' + cont + '">';
        $td.html(div + input);  //fija contenido
    });
    FijModoEdit(but);
}
function rowElim(but) {  //Elimina la fila actual
    var $row = $(but).parents('tr');  //accede a la fila
    params.onBeforeDelete($row);
    $row.remove();
    params.onDelete();
}
function rowAddNew(tabId) {  //Agrega fila a la tabla indicada.
    console.log(tabId);
    var $tab_en_edic = $("#" + tabId);  //Table to edit
    //construye html
    var htmlDat = '<td></td><td></td><td></td><td></td><td></td><td></td><td></td>' + colEdicHtml;
    $tab_en_edic.append('<tr>' + htmlDat + '</tr>');
    params.onAdd();
}
function TableToCSV(tabId, separator) {  //Convierte tabla a CSV
    var datFil = '';
    var tmp = '';
    var $tab_en_edic = $("#" + tabId);  //Table source
    $tab_en_edic.find('tbody tr').each(function () {
        //Termina la edición si es que existe
        if (ModoEdicion($(this))) {
            $(this).find('#bAcep').click();  //acepta edición
        }
        var $cols = $(this).find('td');  //lee campos
        datFil = '';
        $cols.each(function () {
            if ($(this).attr('name') == 'buttons') {
                //Es columna de botones
            } else {
                datFil = datFil + $(this).html() + separator;
            }
        });
        if (datFil != '') {
            datFil = datFil.substr(0, datFil.length - separator.length);
        }
        tmp = tmp + datFil + '\n';
    });
    return tmp;
}
