define(['jquery', 'compartido/notificaciones'],
    function ($, Not) {

        jQuery.fn.extend({
            checkSecurity: function () {
                return this.each(function () {
                    var item = this;
                    var sw = false;
                    var _funciones = $(item).attr("data-funcion");
                    if (_funciones) {
                        var _permisos = _funciones.split(' ');
                        jQuery.each(window.app.sesion.attributes.funciones, function (index, value) {
                            _permisos.forEach(function (valor, indice, array) {
                                if (value.codigo == valor) {
                                    sw = true;
                                    return;
                                }
                            });

                        });
                        if (!sw) {
                            $(item).fadeTo(0, 0.5);
                            $(item).removeAttr('onclick');
                            $(item).click(function (e) {
                                e.preventDefault();
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                return false;
                            });
                        }
                    }

                });
            }

        });

        String.format = function () {
            // The string containing the format items (e.g. "{0}")
            // will and always has to be the first argument.
            var theString = arguments[0];

            // start with the second argument (i = 1)
            for (var i = 1; i < arguments.length; i++) {
                // "gm" = RegEx options for Global search (more than one instance)
                // and for Multiline search
                var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                theString = theString.replace(regEx, arguments[i]);
            }

            return theString;
        }

        // Returns the ISO week of the date.
        Date.prototype.getWeek = function () {
            var date = new Date(this.getTime());
            date.setHours(0, 0, 0, 0);
            // Thursday in current week decides the year.
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            // January 4 is always in week 1.
            var week1 = new Date(date.getFullYear(), 0, 4);
            // Adjust to Thursday in week 1 and count number of weeks from date to week1.
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                - 3 + (week1.getDay() + 6) % 7) / 7);
        }

        // Obtiene el lunes de la semana a la que pertenece la fecha
        Date.prototype.getMonday = function () {
            let d = new Date(this);
            let day = d.getDay(),
                diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
            return new Date(d.setDate(diff));
        }

        // Devuelve una nueva fecha tomando la fecha pasada como UTC y eliminando el offset local
        Date.prototype.inUTC = function () {
            let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
            return d;
        }

        // Comprueba si una fecha está cerca de otra, con un margen en segundos
        Date.prototype.closeTo = function (dt, margen) {
            return this.addSecs(-margen).getTime() <= dt.getTime() && this.addSecs(margen).getTime() >= dt.getTime();
        }

        // Devuelve una nueva fecha sumando los días pasados
        Date.prototype.addDays = function (days) {
            days = days || 0;
            let d = new Date(this.getTime() + days * 24 * 60 * 60000);
            return d;
        }

        // Modifica el objeto fecha actual sumando los días pasados
        Date.prototype._addDays = function (days) {
            days = days || 0;
            this.setDate(this.getDate() + days);
        }

        // Devuelve una nueva fecha sumando las horas pasadas
        Date.prototype.addHours = function (hours) {
            hours = hours || 0;
            let d = new Date(this.getTime() + hours * 60 * 60000);
            return d;
        }

        // Modifica el objeto fecha actual sumando las horas pasadas
        Date.prototype._addHours = function (hours) {
            hours = hours || 0;
            this.setHours(this.getHours() + hours);
        }

        // Devuelve una nueva fecha sumando los minutos pasados
        Date.prototype.addMins = function (mins) {
            mins = mins || 0;
            let d = new Date(this.getTime() + mins * 60000);
            return d;
        }

        // Modifica el objeto fecha actual sumando los minutos pasados
        Date.prototype._addMins = function (mins) {
            mins = mins || 0;
            this.setMinutes(this.getMinutes() + mins);
        }

        // Devuelve una nueva fecha sumando los segundos pasados
        Date.prototype.addSecs = function (secs) {
            secs = secs || 0;
            let d = new Date(this.getTime() + secs * 1000);
            return d;
        }

        // Modifica el objeto fecha actual sumando los segundos pasados
        Date.prototype._addSecs = function (secs) {
            secs = secs || 0;
            this.setSeconds(this.getSeconds() + secs);
        }

        Date.prototype.midnight = function () {
            let d = new Date(this.getTime())
            d.setHours(0, 0, 0, 0);
            return d;
        }

        Date.prototype.midday = function () {
            let d = new Date(this.getTime())
            d.setHours(12, 0, 0, 0);
            return d;
        }

        Date.prototype.formated = function ({ options = [''], separator = '/' }) {
            let that = this;
            const lng = localStorage.getItem('idiomaSeleccionado');
            function format(m) {
                let f = new Intl.DateTimeFormat(lng, m);

                return f.format(that);
            }
            return options.map(format).join(separator);
        }

        ExtendCulture = function () {
            var customCultureES = $.extend(true, {}, kendo.cultures['es-ES'],
                {
                    calendars: {
                        standard: {
                            patterns: {
                                MES_FechaHoraMin: "dd/MM/yyyy HH:mm",
                                MES_FechaHora: "dd/MM/yyyy HH:mm:ss",
                                MES_Fecha: "dd/MM/yyyy",
                                MES_Hora: "HH:mm:ss"
                            },
                        }
                    }
                });

            kendo.cultures['es-ES'] = customCultureES;
            var customCultureEN = $.extend(true, {}, kendo.cultures['en-GB'],
                {
                    calendars: {
                        standard: {
                            patterns: {
                                MES_FechaHoraMin: "yyyy/dd/MM HH:mm",
                                MES_FechaHora: "yyyy/dd/MM HH:mm:ss",
                                MES_Fecha: "yyyy/dd/MM",
                                MES_Hora: "HH:mm:ss"
                            },
                        }
                    }
                });
            kendo.cultures['en-GB'] = customCultureEN;
        }

        GetSecondsForExcel = function (dateTime) {

            var seconds = dateTime.getSeconds();
            seconds += dateTime.getMinutes() * 60;
            seconds += dateTime.getHours() * 3600;

            return seconds / 86400 //Numero de segundos en un día
        }

        // Para convertir una cadena en base64 a un array de enteros de 8 bits
        //Autor: Roberto
        //Fecha: 23-07-2019
        Base64ToArrayBuffer = function (base64) {
            var binaryString = window.atob(base64);
            var len = binaryString.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            return bytes;
        }

        TienePermiso = function (idFuncion) {
            var permiso = false;

            for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                if (window.app.sesion.attributes.funciones[i].id === idFuncion) {
                    permiso = true;
                }
            }

            return permiso;
        }
        // Recibe un array
        TienePermisos = function (idsFuncion) {
            let permiso = false;

            let i = 0;
            while (!permiso && i < window.app.sesion.attributes.funciones.length) {
                const id = window.app.sesion.attributes.funciones[i].id;
                if (idsFuncion.some(s => s === id)) {
                    permiso = true;
                }
                i++;
            }

            return permiso;
        }

        FormatearFechaPorRegion = function (fecha, format = 'dd/MM/yyyy HH:mm:ss') {
            return kendo.toString(kendo.parseDate(fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora), format);
        }

        FormatearNumericosPorRegion = function (valor) {
            if (localStorage.getItem("idiomaSeleccionado") != 'es-ES')
                valor = valor.replace(',', '.');
            return valor;
        }

        //Pasar fecha con formato '20251104T103023' que viene en UTC a datetime Local
        parseToLocalDate = function (ts) {
            if (!ts) return null;
            var m = String(ts).trim().match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})$/);
            if (!m) return null;
            // ISO con 'Z' para forzar UTC
            var iso = m[1] + '-' + m[2] + '-' + m[3] + 'T' + m[4] + ':' + m[5] + ':' + m[6] + 'Z';
            var d = new Date(iso);
            return isNaN(d.getTime()) ? null : d;
        }

        ConversorHorasMinutosSegundos = function (dato) {
            //La variable dato contiene el resultado de multiplicar la hora en decimal por 3600 que son los segundos
            var isNegativo = dato.toString().includes("-") ? true : false
            dato = Math.abs(Math.round(dato));
            var hora = Math.floor(dato / 3600);
            hora = (hora < 10) ? '0' + hora : hora;
            var minuto = Math.floor((dato / 60) % 60);
            minuto = (minuto < 10) ? '0' + minuto : minuto;
            var segundos = dato % 60;
            segundos = (segundos < 10) ? '0' + segundos : segundos;
            var signo = (isNegativo) ? "-" : "";
            return signo + hora + 'h:' + minuto + 'm:' + segundos + 's';
        }

        ConversorHorasMinutos = function (dato) {
            let result = ConversorHorasMinutosSegundos(dato);
            let lastIndex = result.lastIndexOf(':');
            result = result.slice(0, lastIndex);

            return result;
        }

        ConversorDiasHorasMinutosSegundosAHoras = function (idCaja) {
            var dia, horas, mins, segs, sumhora = "", resthoras = "";
            if ($("#txtDia" + idCaja).val() == "") {
                dia = $("#txtDia" + idCaja).text()
            }
            else {
                dia = $("#txtDia" + idCaja).val();
                sumhora = parseInt(dia) * 24;
            }

            //horas
            if ($("#txtHora" + idCaja).val() == "") {
                horas = $("#txtHora" + idCaja).text();
            }
            else {
                horas = $("#txtHora" + idCaja).val();
                sumhora = sumhora + parseInt(horas);
            }
            if (sumhora !== "") {
                resthoras = parseInt(sumhora);
            }
            //minutos
            if ($("#txtMinutos" + idCaja).val() == "") {
                mins = $("#txtMinutos" + idCaja).text();
            }
            else {
                mins = $("#txtMinutos" + idCaja).val();
                {
                    mins = parseInt(parseInt(mins)) / 60;
                    if (resthoras == "") {
                        resthoras = parseFloat(parseFloat(mins));
                    } else {
                        resthoras = parseFloat(resthoras) + parseFloat(parseFloat(mins));
                    }

                }
            }
            //segundos
            if ($("#txtSegundos" + idCaja).val() == "") {
                segs = 0;
            }
            else {
                segs = $("#txtSegundos" + idCaja).val();
                if (segs !== 0) {
                    segs = parseFloat(parseFloat(parseInt(segs) / 3600));
                }
                if (resthoras == "") {
                    resthoras = segs;
                } else {
                    resthoras = parseFloat(resthoras) + segs
                }

            }
            if (resthoras == undefined) {
                resthoras = ""
            }
            return resthoras;
        }


        /// Comprueba si todos los campos required de un formulario tienen valor
        // Autor: Daniel Abad
        ValidarFormulario = function (elem) {
            let valido = true;
            $(`#${elem}`).find("[required]").each(function (index) {
                if ($(this).val() == null || $(this).val() == "") {
                    valido = false;
                }

                // Los ComboBox de kendo tienen valor aunque no sean validos de entre sus opciones, hay que comprobar el selectedIndex
                let comboBox = $(this).getKendoComboBox();
                if (comboBox && comboBox.selectedIndex == -1) {
                    valido = false;
                }
            })

            return valido;
        }

        /// Devuelve un string con todos los campos obligatorios (con el atributo required) de un form, separados por coma.
        // Recibe el id del formulario html, y la estructura debe ser:
        //* <div> <label for="id_input"> TEXTO_A_DEVOLVER </label> <input required/> </div>
        // Al devolver el texto de las labels ya traducidos, no es necesario construir los strings en cada idioma
        // Autor: Daniel Abad
        ObtenerCamposObligatorios = function (form) {
            let resultado = [];
            $("#" + form + " div:has([required])").find("label").each(function (idx, e) {
                if ($("#" + $(e).attr("for")).attr("required") == 'required') {
                    resultado.push($(e).html());
                }
            });

            if (resultado.length == 0) {
                return "";
            }
            else if (resultado.length == 1) {
                return window.app.idioma.t('FORMULARIO_CAMPO_OBLIGATORIO').replace("#CAMPO", resultado[0])
            } else {
                let campos = resultado.join(", ").replace(/,(?=[^,]*$)/, ` ${window.app.idioma.t("Y_GRIEGA")}`);

                return window.app.idioma.t('FORMULARIO_CAMPOS_OBLIGATORIOS').replace("#CAMPOS", campos);
            }
        }

        /// Devuelve la descripción "humana" de una línea pasando su ID
        // Autor: Daniel Abad
        ObtenerLineaDescripcion = function (lineaId) {
            let linea = "--";

            if (typeof (lineaId) === 'number') {
                linea = window.app.planta.lineas.filter(p => p.numLinea == lineaId);
            }
            else {
                linea = window.app.planta.lineas.filter(p => p.id == lineaId);
            }

            if (linea && linea.length > 0) {
                return `${window.app.idioma.t('LINEA')} ${linea[0].numLineaDescripcion} - ${linea[0].descripcion}`
            } else {
                return "--"
            }
        }

        ParseDescriptionToHTML = function (desc) {
            var parser = new DOMParser;
            var dom = parser.parseFromString('<!doctype html><body>' + desc, 'text/html');
            var decodedString = dom.body.textContent;
            if (desc) {
                return decodedString;
            } else {
                return '';
            }
        }

        CodificarEnHTML = function (str) {
            return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;');
        }

        CodificarEnHTML2 = function (str) {
            var encoded = str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");

            return encoded
                .replace(/\r\n|\r|\n/g, "<br/>")
        }

        SanearNombreArchivo = function (fileName, replaceChar = '_') {
            // Dividir el nombre del archivo en nombre base y extensión
            let partes = fileName.split('.');

            // Extraer la extensión (el último elemento)
            let extension = partes.pop();

            // Reunir el nombre base (el resto del array)
            let nombreBase = partes.join('.');

            // Reemplazar todos los puntos en el nombre base por el carácter deseado
            let nombreBaseModificado = nombreBase.replace(/\./g, replaceChar);

            // Unir el nombre base modificado con la extensión
            let nombreArchivoModificado = `${nombreBaseModificado}.${extension}`;

            return nombreArchivoModificado;
        }

        SetCultura = function () {
            if (localStorage.getItem("idiomaSeleccionado") == "es-ES") {
                var customUS = $.extend(true, {}, kendo.culture(), {
                    name: "custom-ES",
                    numberFormat: {
                        ",": ".",
                        ".": ",",
                        currency: {
                            ",": ".",
                            ".": ",",
                        },
                        percent: {
                            ",": ".",
                            ".": ",",
                        }
                    }
                });
                kendo.cultures["custom-ES"] = customUS;
                kendo.culture("custom-ES");
            }
        }

        /// Abre una alerta de aviso con mensaje y 2 botones Aceptar y Cancelar. 
        /// Puede personalizarse el título de la ventana, el mensaje, y la acción que se lanzará al pulsar aceptar.
        /// Las "options" pueden usarse para personalizar el ancho y el alto de la ventana, y existe la opción mandatoryAction para 
        /// que enviando un callback sea obligatorio ejecutarlo, por lo que no aparecerá botón de cerrar ni de cancelar, sólo aceptar y se ejecutará el callback
        /// DAJ: 19/12/2022
        OpenWindow = function (title, msg, acceptCallback, options) {
            const isTerminal = IsTerminal();

            const width = options?.width || "400px";
            const height = options?.height || "";
            const okMsg = options?.okMsg || window.app.idioma.t('ACEPTAR');
            const cancelMsg = options?.cancelMsg || window.app.idioma.t('CANCELAR');
            const showClose = options?.showClose != undefined ? options.showClose : options?.mandatoryAction ? false : true;

            let ventana = $("<div id='dlgModalCustom'/>").kendoWindow({
                title: title,
                width: width,
                height: height,

                content: isTerminal ? "../Portal/html/dialogoConfirmKversion.html" : "html/dialogoConfirmKversion.html",
                draggable: false,
                scrollable: false,
                close: function () {
                    ventana.destroy();
                },
                actions: !showClose ? [] : ["Close"],
                resizable: false,
                modal: true,
                refresh: function () {

                    let ventanaElem = $("#dlgModalCustom");
                    ventanaElem.find("#msgDialogo").html(msg);
                    ventanaElem.find("#btnDialogoConfirmAceptar").val(okMsg);

                    if (acceptCallback && !(options?.mandatoryAction)) {
                        ventanaElem.find("#btnDialogoConfirmCancelar").val(cancelMsg);
                        ventanaElem.find("#btnDialogoConfirmCancelar").kendoButton({
                            click: function (e) {
                                e.preventDefault();
                                if (options?.cancelCallback) {
                                    options.cancelCallback();
                                }
                                ventana.close();
                            }
                        });
                    } else {
                        ventanaElem.find("#btnDialogoConfirmCancelar").hide();
                    }

                    ventanaElem.find("#btnDialogoConfirmAceptar").kendoButton({
                        click: function (e) {
                            e.preventDefault();
                            if (acceptCallback) {
                                acceptCallback();
                            }
                            ventana.close();
                        }
                    });

                    ventanaElem.find(".botonDialogo").removeClass("botonDialogo");

                    if (typeof ventana != "undefined") {
                        ventana.center().open();
                    }
                }
            }).getKendoWindow();
        }

        IsTerminal = function () {
            return window.location.href.toLowerCase().includes("terminal");
        }

        IsSolan = function () {
            return window.app.planta.Id.includes("SOLAN");
        }

        GenerarInforme = function (title, url, options) {

            options.height = options.height || "70%";
            options.width = options.width || "90%";


            let dlgVistaInforme = $("<div id='dlgVistaInforme'/>").kendoWindow({
                title: title,
                modal: true,
                resizable: false,
                draggable: false,
                actions: ['Close'],
                scrollable: false,
                content: window.location.protocol + "//" + window.location.host + "/Informes/" + url,//InformeFPA.aspx?prod=" + producto.codigo,
                height: options.height,
                width: options.width,
                iframe: true,
                close: function (e) {
                    //history.back();
                    //self.dlgVista = null;
                }
            }).data("kendoWindow");

            dlgVistaInforme.wrapper.addClass("mi-dlgVistaInforme");

            dlgVistaInforme.center().open();
        }

        ConversorHHMMSS_Segundos = function (hhmmss) {
            const [hours, minutes, seconds] = hhmmss.split(":");

            return Number((+hours * 60 * 60) + (+minutes * 60) + (+seconds));
        }

        GetDurationForExcelFromSeconds = function (seconds) {
            // En excel 1 equivale a 24 H
            let factor = 86400 // segundos en 1 día

            return seconds == 0 ? 0 : seconds / factor;
        }

        // Las fechas en excel son el nº de días pasados desde 1/1/1900 hasta la fecha, y la parte decimal representa el tiempo en segundos
        GetDateForExcel = function (date) {
            if (!date) {
                return '';
            }
            const dateDiference = 25569.0; // Diferencia entre la fecha inicial en EXCEL (1900/1/1) y la fecha de inicio de javascript (1970/1/1);
            //const refDate = new Date("1899-12-29T22:00:00Z");
            const msDay = 1000 * 60 * 60 * 24;

            const dateLocal = date.getTime() - (date.getTimezoneOffset() * 60 * 1000);

            return dateDiference + (dateLocal / msDay);
            //return (date - refDate) / msDay;
        }

        rgb2hex = function (rgb) {
            let hexDigits = new Array
                ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");

            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);

            function hex(x) {
                return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            }
        }

        hex2rgb = function(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        ColorTextoBlancoNegro = function (color) {
            let rgb = hex2rgb(color);
            let c = "#000";
            if (rgb) {
                let Y = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b
                c = Y < 128 ? "#FFF" : c;
            }

            return c;          
        }

        /// Devuelve true si los elementos pasados se solapan entre si. Se esperan selectores de jQuery
        SolapamientoElementos = function (el1, el2) {
            let domRect1 = el1.get(0).getBoundingClientRect();
            let domRect2 = el2.get(0).getBoundingClientRect();

            return !(
                domRect1.top > domRect2.bottom ||
                domRect1.right < domRect2.left ||
                domRect1.bottom < domRect2.top ||
                domRect1.left > domRect2.right
            );
        }

        /// Esta función escala el tamaño de un texto hasta que quepa en un contenedor, o alcance un tamaño minimo. Elementos jQuery
        EscalarTextoContenedor = function ({ cont, text, options }) {
            const minFontSize = options?.minFontSize || 10;

            const maxWidth = cont.width();
            let actualFontSize = parseInt(text.css('font-size'));

            while (text.width() > maxWidth && actualFontSize > minFontSize) {
                actualFontSize -= 1;
                text.css("font-size", actualFontSize + "px");
            }
        }

        /// Esta función devuelve el porcentaje (del 0-1) de tiempo de un rango de fechas R1, 
        /// que cae dentro de otro rango R2 (p.e.para calcular el porcentaje de WO que pertenece a una semana / dia)
        /// d1 es la duración real del rango R1 (ya que las WOs pueden tener tiempo no planificado dentro que no debe contarse)
        DuracionProporcional = function (startR1, endR1, d1, rangos) {

            let duracionTotalInterseccion = 0;

            for (let r of rangos) {
                const startR2 = r.inicio;
                const endR2 = r.fin;

                // Si comienza después del rango o termina antes del rango, no hay intersección
                if (endR1 <= startR2 || startR1 >= endR2) {
                    continue;
                }

                // Calcular el inicio y fin de la intersección entre la tarea y el rango
                const interseccionInicio = Math.max(startR1.getTime(), startR2.getTime());
                const interseccionFin = Math.min(endR1.getTime(), endR2.getTime());

                // Calcular la duración de la intersección
                const duracionInterseccion = interseccionFin - interseccionInicio;

                const duracionInterseccionMinutos = Math.ceil(duracionInterseccion / 60000);

                duracionTotalInterseccion += duracionInterseccionMinutos;
            }

            // Calcular el porcentaje
            const duracionTotal = d1 || Math.ceil((endR1 - startR1) / 60000);
            const porcentaje = (duracionTotalInterseccion / duracionTotal);

            return porcentaje;

        }

        /// Funcion que devuelve la duracion entre 2 fechas en formato X dias HH:mm:ss
        DuracionATexto = function (inicio, fin) {
            const diferencia = fin - inicio;

            // Calcular los días, horas, minutos y segundos
            var dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            var horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
            var segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

            return `${dias ? dias + ' días ' : ''}${kendo.toString(horas, '00')}:${kendo.toString(minutos, '00')}:${kendo.toString(segundos, '00')}`;
        }

        /// Para obtener los enlaces relacionados con el MSM Library. Si no se encuentra el enlace solicitado no devuelve error pero sí resultado vacío
        ObtenerEnlaceExternoMSMLibrary = async function (idEnlace) {
            return new Promise((resolve) => {
                $.ajax({
                    type: "GET",
                    url: "../api/obtenerEnlaceExterno/" + idEnlace,
                    dataType: 'json',
                    cache: true,
                    success: function (data) {
                        resolve(data);
                    },
                    error: function (err) {
                        console.log(err);
                        resolve();
                    }
                });
            });
        }

        /// La version actual de kendo presenta un bug en los DropDownList, si se carga con muchos datos y 
        /// luego se carga con ningun dato (por ejemplo en listados anidados), se queda con la altura anterior aunque no tenga elementos
        RefrescarAlturaDropDownListKendo = function (kddl) {
            kddl.popup.element.css("height", "");
            kddl.popup.element.find("div[unselectable=on]").css("height", "");
        }

        /// Al recargar una ventana que tenga elementos de kendo, hay que destruir las referencias para evitar problemas.
        /// Si la ventana da un error al cambiar el idioma, llamar a esta función al inicio del render
        DestruirKendoWidgets = function(self) {
            self.$el.find("[data-role]").each(function () {
                var widget = kendo.widgetInstance($(this));
                if (widget) {
                    widget.destroy();
                }
            });
        }

        // Se reemplaza el año de la fecha del turno porque al traer la fecha de 1899 la conversión la realiza con la de esa fecha 
        // y no la actual, es decir, para el turno de las 7h la conversión para esa fecha es 05:45 y para la fecha actual es 07:00.
        // Esta fecha de turno se debería cambiar en bbdd pero no sabemos en que perjudicaría.
        // Pendiente de revisar las implicaciones
        GetHourFromDate = function(date, actualDate) {
            let hour = new Date(date.replace("1899", actualDate.getFullYear())).getHours();
            return hour;
        }

        // Devuelve el valor de filtrado en el grid de los campos pasados por parámetro (array de strings)
        ObtenerFiltrosGrid = function (grid, campos) {
            var ds = kendo.widgetInstance($("#" + grid)).dataSource;
            var filter = ds.filter();

            var result = {};

            if (filter?.filters) {
                valorFiltroRecursivo(result, filter.filters, campos);
            }

            return result;

            function valorFiltroRecursivo(result, filtros, campos) {
                for (let f of filtros) {
                    if (f.filters) {
                        valorFiltroRecursivo(result, f.filters, campos);
                    } else {
                        if (campos.includes(f.field) && !filtros.some(o => o !== f && o.field === f.field)) {
                            result[f.field] = f.value instanceof Date ? f.value.toISOString() : f.value;
                        }
                    }
                }
            }
        }

        /// Recarga un kendogrid de forma limpia (sólo 1 llamada al server, reseteo de los filtros del grid etc) - DAJ: 12/02/2025
        /// Si no se pasa un dataSource, la función lo obtiene del propio grid
        /// options: 
        ///     page: (defecto 1), la página en la que se encuentra el grid
        ///     pageSize: (defecto el mismo que el ds), define el nº de elementos por página
        ///     sort: (defecto el que tenga el grid actualmente), el orden aplicado al grid. Con [] se resetea el orden y con ds.sort() se mantiene
        ///     group: (defecto se resetea), la agrupación inicial aplicada al grid. Con [] se resetea y con ds.group() se mantiene
        ///     filter: (por defecto se resetea), el filtro aplicado al grid. Con [] se resetea el filtro y con ds.filter() se mantiene
        RecargarGrid = function ({ grid, ds, options }) {
            if (!grid) {
                return;
            }

            const _ds = ds || grid.dataSource;

            if (!_ds) {
                return;
            }

            // Esta línea permite identificar cuando una llamada al dataBound del grid es "falsa", ya que en este caso salta al asignar el array vacío al dataSource
            // y saltará de nuevo al aplicar el query con la llamada al server real.
            grid.dirtyDatabound = true;
            // Dejando el datasource vacío asegura que la función query hará una llamada a read
            _ds.data([]);            
            _ds.query({
                page: options?.page || 1,
                pageSize: options?.pageSize || _ds.pageSize(),
                sort: options?.sort || _ds.sort(),
                group: options?.group || [],
                filter: options?.filter || []
            });
            grid.dirtyDatabound = false;
            // Esta linea fuerza que se recarguen los filtros del propio grid para evitar
            // errores por filtros ya cacheados
            grid._thead();
        }

        // Convierte una lista de objetos json en un array de operaciones patch
        // Cada objeto debe llevar su Id en un campo "Id"
        // TODO añadir operaciones "add" y "remove"
        ConvertirPatch = function (objects) {

            let patchOperations = [];

            for (let o of objects) {
                let po = {
                    Id: 0,
                    Patches: []
                };

                for (let k of Object.keys(o)) {
                    if (k.toLowerCase() == "id") {
                        po.Id = parseInt(o[k]);
                        continue;
                    }
                    po.Patches.push({
                        Op: "replace",
                        Path: `/${k}`,
                        Value: o[k]
                    })
                }

                patchOperations.push(po);
            }

            return patchOperations;
        }

        /// Esta función procesa los datos a exportar de un grid a una hoja de excel, para aplicar todas las operaciones extra posibles
        /// Aplica color de fondo distinto a las filas pares
        /// No exporta columnas ocultas, sin "field" definido, ni con el atributo "exportable: { excel: false }
        /// Aplica formatos especiales a las columnas, definidos en su atributo _excelOptions:
        /// - width: define al ancho para la columna en el excel (puede ser distinto al definido en el grid, o "auto" para autowidth)
        /// - template: define el template que se usará para el value de la celda. Al template se le pasa el dataitem asociado a la fila, en el campo "value"
        /// - format: define el formato que se aplicará a la celda
        /// - title: define el nombre de la columna en el excel (puede ser distinto al del grid)
        /// TIPS: Para celdas de tipo fecha, configurar al format como "dd/mm/yy hh:mm:ss" y el template como "#=GetDateForExcel(value)#"
        ///     para celdas tipo duracion como el anterior pero con format "[hh]:mm:ss"
        ExcelGridExtra = function (e, util) {
            const gridColumns = e.sender.columns.filter(f => !f.hidden && f.field != null);
            let sheet = e.workbook.sheets[0];

            // recorremos las columnas hacia atrás para poder borrar las que no necesitemos sin afectar los bucles
            for (let i = gridColumns.length - 1; i >= 0; i--) {
                let c = gridColumns[i];

                // Eliminamos las columnas y sus celdas que no sean exportables
                if (c.exportable != undefined && !c.exportable.excel) {
                    // descartamos esta columna del excel
                    sheet.columns.splice(i, 1);
                    sheet.rows.map(r => {
                        r.cells.splice(i, 1);
                        return r;
                    });

                    continue;
                }

                let excelColumn = sheet.columns[i];

                // Columnas especiales
                if (c._excelOptions) {
                    let op = c._excelOptions;

                    // Anchos de columna
                    if (op.width) {
                        if (op.width == "auto") {
                            excelColumn.autoWidth = true;
                            excelColumn.width = null;
                        } else {
                            excelColumn.autoWidth = false;
                            excelColumn.width = op.width;
                        }                        
                    }

                    if (op.title) {
                        sheet.rows[0].cells[i].value = op.title;
                    }

                    let index = 0;
                    // Aplicar color de fondo a las filas pares
                    for (let r of sheet.rows) {
                        if (r.type == 'data' && index % 2 == 0 && util) {
                            r.cells.map(cl => {
                                $.extend(cl, util.ui.default.excelCellEvenRow);
                                return cl;
                            })
                        }

                        if (r.type == 'data') {
                            const dataItem = e.data[index - 1];

                            // template específica
                            if (op.template != null) {
                                const tmplt = kendo.template(op.template);
                                const val = tmplt({ value: dataItem });
                                r.cells[i].value = isNaN(parseFloat(val)) ? val : parseFloat(val);
                            }
                            // formato específico
                            if (op.format != null) {
                                r.cells[i].format = op.format
                            }
                        }

                        index++;
                    }
                }
            }

            sheet.filter.to = sheet.columns.length - 1;

            return sheet;
        }
    });