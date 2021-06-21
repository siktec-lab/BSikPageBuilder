/******************************************************************************/
// Created by: SIKTEC - BSik.
// Release Version : 1.0.0
// Creation Date: 2021-06-13
// Copyright 2021, Shlomo Hassid.
/******************************************************************************/
/*****************************      Changelog       ****************************
version:
    ->initial
*******************************************************************************/
/*******************************************************************************
 * EXAMPLE
{
    core : {           <<<------  GROUP NAME
        order : 1,     <<<------  GROUP ORDER
        controls: {    <<<------  CONTROLS DEFINITION
            settings : {    <<<------  CONTROL ATTACHED TO API HANDLER
                order: 2,
                state: true,
                name: "Settings Panel",
                desc: "Open Settings Panel",
                icon: "fas fa-cog",
                run: "openPanel",
                params: ["core-settings"],
                stateOn:  "clipboard-has",
                stateOff: "clipboard-empty",
                lang : {
                    english : { name : "Settings Panel", desc: "Open Settings Panel" },
                    french  : { name : "Settings Panel", desc: "Open Settings Panel" }
                }
            },
            apiAccess : { <<<------  CONTROL ATTACHED TO APPLICATION API EXECUTION
                order: 1,
                state: true,
                name: "Run Command",
                desc: "Open Settings Panel",
                icon: "fas fa-user",
                run: "execute",
                params: ["messageBar", "custom", "from custom control", "fas fa-user"],
                stateOn:  "clipboard-has",
                stateOff: "clipboard-empty",
                lang : {
                    english : { name : "Settings Panel", desc: "Open Settings Panel" },
                    french  : { name : "Settings Panel", desc: "Open Settings Panel" }
                }
            },
            rawCode : { <<<------  CONTROL ATTACHED TO CUSTOM FUNC
                order: 1,
                state: true,
                name: "Run Command",
                desc: "Open Settings Panel",
                icon: "fas fa-users",
                stateOn:  "clipboard-has",
                stateOff: "clipboard-empty",
                run: function(el) {
                    console.log("costum function - with this and caller");
                    console.log(el);
                    console.log(this);
                },
                lang : {
                    english : { name : "Settings Panel", desc: "Open Settings Panel" },
                    french  : { name : "Settings Panel", desc: "Open Settings Panel" }
                }
            } 
        }
    }
}
 */
;(function($) {

    //Make sure assets are defined:
    if ($.hasOwnProperty("SikPageBuilder")) {
        $.extend(true, $.SikPageBuilder.controls, {
            core : {
                order : 1,
                controls: {
                    settings : {
                        order: 1,
                        name: "Settings Panel",
                        desc: "Open Settings Panel",
                        icon: "fas fa-cog",
                        run: "openPanel",
                        params: ["core-settings"],
                        lang : {
                            english : { name : "Settings Panel", desc: "Open Settings Panel" },
                            french  : { name : "Settings Panel", desc: "Open Settings Panel" }
                        }
                    },
                    copyElement : {
                        order: 2,
                        name: "Copy Element",
                        desc: "Copy Current Working Element",
                        icon: "fas fa-clone",
                        run: "execute",
                        params: ["copyElement"],
                        lang : {
                            english : { name : "Copy Element", desc: "Copy Current Working Element" },
                            french  : { name : "Copy Element", desc: "Copy Current Working Element" }
                        }
                    },
                    cropElement : {
                        order: 2,
                        name: "Cut Element",
                        desc: "Cut Current Working Element",
                        icon: "fas fa-cut",
                        run: "execute",
                        params: ["cropElement"],
                        lang : {
                            english : { name : "Cut Element", desc: "Cut Current Working Element" },
                            french  : { name : "Cut Element", desc: "Cut Current Working Element" }
                        }
                    }, 
                    pasteElement : {
                        order: 2,
                        state: false,
                        name: "Paste Element",
                        desc: "Paste from clipboard",
                        icon: "fas fa-clipboard",
                        run: "execute",
                        params: ["pasteElement"],
                        stateOn:  "clipboard-has",
                        stateOff: "clipboard-empty",
                        lang : {
                            english : { name : "Paste Element", desc: "Paste from clipboard" },
                            french  : { name : "Paste Element", desc: "Paste from clipboard" }
                        }
                    }, 
                }
            }
        });
    } else {
        console.warn("SikPageBuilder controls definition must be included after the main plugin script");
    }
})(jQuery);