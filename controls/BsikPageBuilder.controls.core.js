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
                        state: true,
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
                    toggleView : {
                        order: 2,
                        state: true,
                        name: "Toggle Builder View",
                        desc: "Toggle Builder View",
                        icon: "fas fa-eye",
                        iconStates: [
                            { type : "fas fa-eye",       events : "viewstate-builder"},  
                            { type : "fas fa-eye-slash", events : "viewstate-normal"}
                        ],
                        run: "execute",
                        params: ["toggleBuilderStyleView", "toggle"],
                        lang : {
                            english : { name : "Toggle Builder View", desc: "Toggle Builder View" },
                            french  : { name : "Toggle Builder View", desc: "Toggle Builder View" }
                        }
                    },
                    moveUp : {
                        order: 3,
                        state: false,
                        name: "Move Element Up",
                        desc: "Move selected element up the hierarchy",
                        icon: "fas fa-level-up-alt",
                        run: "execute",
                        params: ["moveElement", "prev"],
                        stateOn:  "selected-element",
                        stateOff: "selected-root",
                        saveBefore: true,
                        lang : {
                            english : { name : "Move Element Up", desc: "Move selected element up the hierarchy" },
                            french  : { name : "Move Element Up", desc: "Move selected element up the hierarchy" }
                        }
                    },
                    moveDown : {
                        order: 4,
                        state: false,
                        name: "Move Element Down",
                        desc: "Toggle Builder View",
                        icon: "fas fa-level-down-alt",
                        run: "execute",
                        params: ["moveElement", "next"],
                        stateOn:  "selected-element",
                        stateOff: "selected-root",
                        saveBefore: true,
                        lang : {
                            english : { name : "Move Element Down", desc: "Move selected element down the hierarchy" },
                            french  : { name : "Move Element Down", desc: "Move selected element down the hierarchy" }
                        }
                    },
                    copyElement : {
                        order: 5,
                        state: false,
                        name: "Copy Element",
                        desc: "Copy Current Working Element",
                        icon: "fas fa-clone",
                        run: "execute",
                        params: ["copyElement"],
                        stateOn:  "selected-element",
                        stateOff: "selected-root",
                        lang : {
                            english : { name : "Copy Element", desc: "Copy Current Working Element" },
                            french  : { name : "Copy Element", desc: "Copy Current Working Element" }
                        }
                    },
                    cropElement : {
                        order: 6,
                        state: false,
                        name: "Cut Element",
                        desc: "Cut Current Working Element",
                        icon: "fas fa-cut",
                        run: "execute",
                        params: ["cropElement"],
                        stateOn:  "selected-element",
                        stateOff: "selected-root",
                        saveBefore: true,
                        lang : {
                            english : { name : "Cut Element", desc: "Cut Current Working Element" },
                            french  : { name : "Cut Element", desc: "Cut Current Working Element" }
                        }
                    }, 
                    pasteElement : {
                        order: 7,
                        state: false,
                        name: "Paste Element",
                        desc: "Paste from clipboard",
                        icon: "fas fa-clipboard",
                        run: "execute",
                        params: ["pasteElement"],
                        stateOn:  "clipboard-has",
                        stateOff: "clipboard-empty",
                        saveBefore: true,
                        lang : {
                            english : { name : "Paste Element", desc: "Paste from clipboard" },
                            french  : { name : "Paste Element", desc: "Paste from clipboard" }
                        }
                    },
                    removeElement : {
                        order: 8,
                        state: false,
                        name: "Remove Element",
                        desc: "Remove selected element",
                        icon: "fas fa-trash",
                        run: "execute",
                        params: ["removeElement"],
                        stateOn:  "selected-element",
                        stateOff: "selected-root",
                        saveBefore: true,
                        lang : {
                            english : { name : "Remove Element", desc: "Remove selected element" },
                            french  : { name : "Remove Element", desc: "Remove selected element" }
                        }
                    },
                    undoAction : {
                        order: 9,
                        state: false,
                        name: "Undo",
                        desc: "Undo last operation",
                        icon: "fas fa-undo",
                        run: "execute",
                        params: ["recoverState", "undo"],
                        stateOn:  "state-moveback",
                        stateOff: "state-min",
                        lang : {
                            english : { name : "Undo", desc: "Undo last operation" },
                            french  : { name : "Undo", desc: "Undo last operation" }
                        }
                    },
                    redoAction : {
                        order: 10,
                        state: false,
                        name: "Redo",
                        desc: "Redo last operation",
                        icon: "fas fa-redo",
                        run: "execute",
                        params: ["recoverState", "redo"],
                        stateOn:  "state-moveforward",
                        stateOff: "state-max",
                        lang : {
                            english : { name : "Redo", desc: "Redo last operation" },
                            french  : { name : "Redo", desc: "Redo last operation" }
                        }
                    },
                    devider : { 
                        order : 11
                    }
                }
            }
        });
    } else {
        console.warn("SikPageBuilder controls definition must be included after the main plugin script");
    }
})(jQuery);