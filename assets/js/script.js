/*
Bootstable
 @description  Javascript library to make HMTL tables editable, using Bootstrap
 @version 1.1
 @autor Tito Hinostroza
*/
"use strict";
//Global variables
var URL = "http://bolos-calculadora.herokuapp.com/produtos";
var params = null;  		//Parameters
var colsEdi = null;
var newColHtml = '<div class="btn-group">' +
    '<button id="bElim" type="button" class="btn btn-sm btn-default" onclick="rowElim(this);">' +
    '<span class="fa fa-trash" > </span>' +
    '</button>' +
    '</div>';
var colEdicHtml = '<td name="buttons">' + newColHtml + '</td>';

$.fn.BuscaProdutos = function () {

    //Get na URL
    //Transformar o json de retorno em um tabela HTML

    var response = "";
    $.ajax({
        url: URL,
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            response = res;
            //console.log(Object.getPrototypeOf(res))
            $(function () {
                $.each(response, function (i, item) {
                    var $tr = $('<tr id="' + item.id + '">').append(
                        $('<td>').text(i),
                        $('<td>').text(item.nome),
                        $('<td><input type="number" class="semborda centralizar"' +
                                'id="inputqtd' + i + '" value="0.00" onChange="formatarFloat(this.id)"/>'),
                        $('<td><select id="un' + item.id + '" onChange="changeUnidade(value)"></select>'),
                        $('<td>').text(item.valorcusto),
                        $('<td>').text(item.unidadecusto),
                        $('<td>').text(item.custounitario),
                        $('<td>').text("0.00"),
                        colEdicHtml
                    ).appendTo('#tbbody');
                    //console.log($tr.wrap('<p>').html());
                    $.each(item.unidades, function (key, value) {
                        $("#un" + item.id).append(
                            "<option value=" + value + ">" + key + "</option>"
                        )
                    })
                });
            });
            $('#tbbody').SetEditable({
                $addButton: $('#but_add'),
                columnsEd: "1"
            });
        }
    });

    //console.log(response);
    //response = $.parseJSON(response);
    //console.log(Object.getPrototypeOf(response))


    //Firebase
    // Inicializar banco de dados
    //var db = firebase.firestore();

    //Recuperar todos os registros
    //db.collection("produtos").get().then((querySnapshot) => {
    //    querySnapshot.forEach((doc) => {
    //        //console.log(`${doc.id} => ${doc.data()}`);
    //        var produto = doc.data();
    //        //console.log(produto);
    //        //Object.keys(keys).map(a => console.log(a));
    //        $("#tbbody").append(
    //              '<tr id="' + doc.id + '">'
    //            + '<td name="nome">' + produto.nome + '</td>'
    //            + '<td name="quantidade">' + 0 + '</td>'
    //            + '<td name="select"><select id="un' + doc.id + '" onChange="changeUnidade(value)">'
    //            + '</select></td>'
    //            + '<td name="valorcusto">' + numeral(produto.valorcusto).format('0.00') + '</td>'
    //            + '<td name="unidadecusto">' + produto.unidadecusto + '</td>'
    //            + '<td name="custounitario">' + numeral(produto.custounitario).format('0.0000') + '</td>'
    //            + '<td name="valortotal">' + numeral(0).format('0.00') + '</td>'
    //            + colEdicHtml +
    //            + '</tr>'
    //        )
    //        $.each(doc.data().unidades, function (key, value) {
    //            $("#un" + doc.id).append(
    //                "<option value=" + value + ">" + key + "</option>"
    //            )
    //       })
    //    });
    //});
};


$.fn.SetEditable = function (options) {
    var defaults = {
        columnsEd: null,         //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        $addButton: null,        //Jquery object of "Add" button
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

function Recalcular() {
    console.log("Recalculado!");
    var rows = $("#tbbody").get(0).rows;
    var tcustoprodutos = 0;
    for (let i = 0; i < rows.length; i++) {
        //var quantidade = rows[i].cells[1].innerText;
        var quantidade = $("#inputqtd"+rows[i].cells[0].innerText).val();
        var unidadeid = rows[i].id;
        var multiplicador = $("#un" + unidadeid + " option:selected").val();
        var custounitario = rows[i].cells[6].innerText;
        var custottotal = parseFloat(quantidade) * parseFloat(multiplicador) * parseFloat(custounitario)
        tcustoprodutos = tcustoprodutos + custottotal;

        //Formata o valor do custo por linha
        rows[i].cells[7].innerText = numeral(custottotal).format("0.00");

        //console.log("Quantidade = " + quantidade 
        //+ " * multiplicador = " + multiplicador 
        //+ " * custounitario = " + custounitario
        //+ " = total = " + custottotal);
    }

    //Atualiza a tabela de totais
    $("#tcustoproduto").get(0).cells[1].innerText = numeral(tcustoprodutos).format("0.00");
    var tcustosadicionais = $("#inputcustosadic").val();
    //console.log(tcustosadicionais);
    var tgastosextras = (parseFloat(tcustoprodutos) + parseFloat(tcustosadicionais)) * 0.3;
    $("#tgastosextras").get(0).cells[1].innerText = numeral(tgastosextras).format("0.00");
    var tcustototal = parseFloat(tcustoprodutos) + parseFloat(tcustosadicionais) + parseFloat(tgastosextras);
    //console.log(tcustototal);
    $("#tcustototal").get(0).cells[1].innerText = numeral(tcustototal).format("0.00");
    var tvalora = parseFloat(tcustototal) * 2;
    $("#tvalora").get(0).cells[1].innerText = numeral(tvalora).format("0.00");
    var tvalorb = parseFloat(tcustototal) * 3;
    $("#tvalorb").get(0).cells[1].innerText = numeral(tvalorb).format("0.00");
    var tvalorc = parseFloat(tcustototal) * 4;
    $("#tvalorc").get(0).cells[1].innerText = numeral(tvalorc).format("0.00");

}

function IterarCamposEdit($cols, tarea) {
    //Itera por los campos editables de una fila
    var n = 0;
    $cols.each(function () {
        n++;
        if ($(this).attr('name') == 'buttons') return;  //excluye columna de botones
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
$("#inputcustosadic").on('change', function () {
    formatarFloat('inputcustosadic');
    Recalcular();
});
function formatarFloat(obj) {
    var n = parseFloat($("#"+obj).val()).toFixed(2);
    $("#"+obj).val(n)
    Recalcular()
}
function changeUnidade(valor) {
    Recalcular();
}
function FijModoNormal(but) {
    $(but).parent().find('#bElim').show();
    var $row = $(but).parents('tr');  //accede a la fila
    var id = $row.attr('id');
    $row.attr('id', id.substr(1, id.length));  //quita marca
}
function FijModoEdit(but) {
    $(but).parent().find('#bElim').hide();
    var $row = $(but).parents('tr');  //accede a la fila
    var id = $row.attr('id');
    $row.attr('id', '/' + id);  //indica que está en edición
}
function ModoEdicion($row) {
    if ($row.attr('id').substr(0, 1) == '/') {
        return true;
    } else {
        return false;
    }
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
