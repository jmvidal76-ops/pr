define(['jquery', 'keyboard'],
    function ($, KeyBoard) {
        

        jQuery.keyboard.layouts['spanish-qwerty'] = {
            'name': 'spanish-qwerty',
            'lang': ['es'],
            'normal': [
                "\u007c 1 2 3 4 5 6 7 8 9 0 \' \u00bf {bksp}",
                "{tab} q w e r t y u i o p \u0301 +",
                "a s d f g h j k l \u00f1 \u007b \u007d {enter}",
                "{shift} < z x c v b n m , . - {shift}",
                "{accept} {alt} {space} {alt} {cancel}"
            ],
            'shift': [
                "\u00b0 ! \" # $ % & / ( ) = ? \u00a1 {bksp}",
                "{tab} Q W E R T Y U I O P \u0308 *",
                "A S D F G H J K L \u00d1 \u005b \u005d {enter}",
                "{shift} > Z X C V B N M ; : _ {shift}",
                "{accept} {alt} {space} {alt} {cancel}"
            ],
            'alt': [
                "\u00ac 1 2 3 4 5 6 7 8 9 0 \\ \u00bf {bksp}",
                "{tab} @ w e r t y u i o p \u0301 \u0303",
                "a s d f g h j k l \u00f1 \u0302 \u0300 {enter}",
                "{shift} < z x c v b n m , . - {shift}",
                "{accept} {alt} {space} {alt} {cancel}"
            ],
            'alt-shift': [
                "\u00b0 ! \" # $ % & / ( ) = ? \u00a1 {bksp}",
                "{tab} Q W E R T Y U I O P \u0308 *",
                "A S D F G H J K L \u00d1 \u005b \u005d {enter}",
                "{shift} > Z X C V B N M ; : _ {shift}",
                "{accept} {alt} {space} {alt} {cancel}"
            ]
        };

        jQuery.keyboard.language.es = {
            language: 'Espa\u00f1ol (Spanish)',
            display: {
                'a': '\u2714:Aceptar (Cambio+Inscribir)', // check mark - same action as accept
                'accept': 'Aceptar:Aceptar (Mayus+Ins)',
                'alt': 'Alt Gr:Grafemas Alternativos',
                'b': '\u2190:Retroceso',    // Left arrow (same as &larr;)
                'bksp': '\u2190:Borrar',
                'c': '\u2716:Cancelar (Esc)', // big X, close - same action as cancel
                'cancel': 'Cancelar:Cancelar (Esc)',
                'clear': 'C:Vaciar',             // clear num pad
                'combo': '\u00f6:Alternar las Teclas Combinados',
                'dec': ',:Decimal',           // decimal point for num pad (optional), change '.' to ',' for European format
                'e': '\u21b5:Insertar',        // down, then left arrow - enter symbol
                'enter': 'Insert:Insertar',
                'lock': '\u21ea Bloq:Mayús', // caps lock
                's': '\u21e7:Mayús',        // thick hollow up arrow
                'shift': '\u21e7 Mayús:Mayús',
                'sign': '\u00b1:Cambiar Signo',  // +/- sign for num pad
                'space': '&nbsp;:Espacio',
                't': '\u21e5:Tab',          // right arrow to bar (used since this virtual keyboard works with one directional tabs)
                'tab': '\u21e5 Tab:Tab'       // \u21b9 is the true tab symbol (left & right arrows)
            },
            wheelMessage: 'Utilice la rueda del mouse para ver otras teclas'
        };

        KeyBoardSettings = {
            // Inicializa el teclado virtual asociado al elemento "elem" (si no se pasa nada se usa la clase keyboardOn por defecto).
            // Pueden pasarse opciones que se pasarán al plugin keyboard
            Load: function (elem = ".keyboardOn", options = {}) {
                if (localStorage.getItem("tecladoVirtual") == "true") {
                    if (localStorage.getItem("idiomaSeleccionado") == "es-ES") {
                        if (!options || !options.layout) {
                            options.layout = 'spanish-qwerty';
                        } 
                    }

                    $(elem).keyboard(options);
                }
            }
        }
        
        return KeyBoardSettings;

    });