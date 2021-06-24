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

;(function($) {
    //Make sure assets are defined:
    if (!$.hasOwnProperty("SikPageBuilder")) {
        $.SikPageBuilder = {};
        $.SikPageBuilder["languages"]   = {};
        $.SikPageBuilder["elements"]    = {};
        $.SikPageBuilder["controls"]    = {};
    }
    $.SikPageBuilder["build"] = {};

    
    //The core plugin:
    function PageBuilder(el, options) {
        let self, init;
        self = this;
        self.defaults = {
            libraries:              ["Bootstrap v.5.0.1", "core"],
            viewTogglerClass:       "builder-show",
            elementBuilderClass:    "struct-ele",
            elementTaggingClass:    "sik-tagging",
            languagePack :          "english",
            elementsPack :          "bootstrap5",
            extendHandlers:         {},
            style: {
                messageBar : {
                    editingIcon : "fas fa-pen"
                }
            }
        };
        //Store definitions:
        self.settings       = {};
        self.coreControls   = {};
        self.loadedLanguage = {};
        self.elements       = {};

        let registeredLibraries = {
            "core":"css/BsikPageBuilderIframe.css",
            "Bootstrap v.5.0.1": "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
        };
        
        self.tpl = {
            taggingClass        : "sik-tagging",
            tagging             : "<div class='%class%'>%tag%</div>",
            elementBuilderClass : "struct-ele",
            controlsDevider     : "<li class='control-devider'></li>"
        };
        
        let eventNames = {
            viewStateBuilder        : "viewstate-builder",
            viewStateNormal         : "viewstate-normal",
            clipboardHasValue       : "clipboard-has",
            clipboardNowEmpty       : "clipboard-empty",
            stateCanMoveBack        : "state-moveback",
            stateCanMoveForward     : "state-moveforward",
            stateInMinPos           : "state-min",
            stateInMaxPos           : "state-max",
            copyElement             : "element-copy",
            cropElement             : "element-crop",
            pasteElement            : "element-paste",
            removeElement           : "element-remove",
            selectedElement         : "selected-element",
            selectedRoot            : "selected-root",
            moveElement             : "move-element"
        };

        let documentStyle   = [];
        let clipboard       = null;
        self.workingOn      = "";
        
        self.$controls      = $([]);
        self.$toolbars      = $([]);
        // init
        init = function() {
            
            //Expend settings:
            self.settings = $.extend(true, {}, self.defaults, options);
            self.el = el;
            self.$el = $(el);
            self.$el.data("instance", self);

            //Attach user extended handlers:
            $.extend(true, self.handlers, self.settings.extendHandlers);
            //Get definitions:
            self.coreControls = $.SikPageBuilder.controls;
            self.loadedLanguage = $.SikPageBuilder.languages[self.settings.languagePack];
            self.elements = $.SikPageBuilder.elements[self.settings.elementsPack];
            
            //Extend from settings:
            self.tpl.taggingClass          = self.settings.elementTaggingClass;
            self.tpl.elementBuilderClass   = self.settings.elementBuilderClass;

            //Build HTML Structure:
            build();
            
            self.$frame = self.$el.find(">.builder-document").eq(0).contents();
            self.$doc = self.$frame.find("body").eq(0);
            self.$workingHeader = self.$el.find(">.working-header").eq(0);
            self.$mainControlsContainer = self.$el.find(">.controls");
            self.$toolbarControlsContainer = self.$el.find(">.toolbar-controls");
            self.workingOn = self.$doc;

            //Add controls:
            buildMainControls();

            //Add elements controls:
            buildElementsControls();
            
            //Sets core styles inside the iframe:
            pushCoreStyles();

            //Set builder mode:
            toggleBuilderStyleView("show"); /* SH: added - 2021-06-14 => sets builder view should be controlled through the settings */
            //Set working on pointer:
            
            //Attach events of iframe elements:
            attachDocumentEvents();

            //Set default message bar:
            messageBar("working-on");

            return self;
        };

        let build = function() {
            console.log("build");
            //Create structure:
        };

        self.handlers = {
            execute: function(el, fn, ...params) {
                if (typeof this[fn] === "function") {
                    this[fn].apply(this, params);
                }
            },
            openPanel: function(el, pan) {
                console.log("open panel", pan, this);
                return;
            },
            addElement: function(el, group, which) {
                let _to = this.currentWorking();
                return this.addElement(group, which, _to);
            },
            openToolbar: function(el, toolbar) {
                return this.toggleToolbar(el, toolbar);
            }
        };

        
        /************************************************************************************
         * PRIVATE HELPER METHODS
         ***********************************************************************************/
        let attachEventListener = function(type, handler) {
            if (self.hasEventName(type))
                self.$el.bind(type, handler);
            else
                console.warn(`Tried to add Event Listener of unknown event name [${type}]`);
        };
        let detachEventListener = function(type) {
            if (self.hasEventName(type))
                self.$el.unbind(type);
            else
                console.warn(`Tried to remove Event Listener of unknown event name [${type}]`);
        };
        let raiseEvent = function(_events, ...params) {
            let events = Array.isArray(_events) ? _events : [_events];
            console.log("EVENT", events);
            
            //change controls states:
            toggleControls(events);

            //Here we call events related methods:
            for (const e in events) {
                self.$el.trigger(events[e], [self, ...params]);
            }
            
        };
        let eleMove = function(dir, eles, upIfNone = true) {
            let $eles  = $(eles);
            let moved = false;
            $eles.each(function(){
                let $cur = $(this);
                let $prev = $cur.prev(`.${self.tpl.elementBuilderClass}`).not($eles);
                let $next = $cur.next(`.${self.tpl.elementBuilderClass}`).not($eles);
                let $parent = $cur.parent().closest(`.${self.tpl.elementBuilderClass}`).not($eles);
                if (dir === "prev" && $prev.length) {
                    moved = $cur.insertBefore($prev);
                } else if (dir === "prev" && upIfNone && $parent.length) {
                    moved = $cur.insertBefore($parent);
                } else if (dir === "next" && $next.length) {
                    moved = $cur.insertAfter($next);
                } else if (dir === "next" && upIfNone && $parent.length) {
                    moved = $cur.insertAfter($parent);
                } else if (dir === "up" && $parent.length) {
                    moved = $cur.insertBefore($parent);
                }
            });
            return moved !== false;
        };
        let states = {
            stack : [],
            pos : -1,
            get : function(shift = 0) {
                return (states.pos + shift >= 0 && states.stack.length > states.pos + shift) 
                    ? states.stack[states.pos + shift] 
                    : false;
            },
            currentEqual : function(state) {
                return states.get() ? state.hash === states.get().hash : false;
            },
            create : function() {
                let state = {
                    doc         : {
                        head : self.$frame.find("head").html(),
                        body : self.$doc.html()
                    },
                    hash        : 0,
                    controls    : [],
                    toolbars    : [],
                    message     : self.$workingHeader.html(),
                    working     : self.workingOn
                };
                self.$controls.each(function(i, e) { 
                    state.controls.push({
                        disabled : $(e).hasClass("disabled-control"),
                        icon     : $(e).find("i").attr("class"),
                        selected : $(e).hasClass("selected")
                    });
                });
                self.$toolbars.each(function(i, e) { 
                    state.toolbars.push({
                        visible : $(e).is(":visible")
                    });
                });
                state.hash = (state.doc.head + state.doc.body).hashCode();
                return state;
            },
            trimToPos : function() {
                return states.stack.splice(states.pos + 1);
            },
            shrinkToSize(size) {
                if (states.stack.length > size) { 
                    states.stack.shift();
                    states.stack.pos--;
                }
            },
            push : function(state = null) {
                state = state ?? states.create();
                let cur = states.get();
                if (states.stack.length == 0) {
                    states.stack.push(state);
                    states.pos++;
                    states.shrinkToSize(10);
                    return true;
                } else if (cur.hash !== state.hash) {
                    states.trimToPos();
                    states.stack.push(state);
                    states.pos++;
                    states.shrinkToSize(10);
                    return true;
                }
                return false;
            },
            raise : function() {
                if (states.stack.length && states.pos < 0) {
                    raiseEvent(eventNames.stateInMinPos);
                } else if (states.stack.length && states.pos >= 0) {
                    raiseEvent(eventNames.stateCanMoveBack);
                }
                if (states.stack.length && states.pos >= states.stack.length - 1) {
                    raiseEvent(eventNames.stateInMaxPos);
                } else if (states.stack.length && states.pos >= -1) {
                    raiseEvent(eventNames.stateCanMoveForward);
                }
            }
        };

        /************************************************************************************
         * PUBLIC ACTION METHODS
         ***********************************************************************************/
        // public methods
        let setCurrentWorking = function(_ele = null, multi = false) {
            let $ele = $(_ele ?? self.$doc);
            let $prevElements = self.$doc.find(`.${self.tpl.elementBuilderClass}`);
            //Check if its root:
            if (self.$doc.get(0) === $ele.get(0)) {
                if (multi) return; // if multiple selection avoid adding root
                self.workingOn = self.$doc;
                $prevElements.removeClass("active-working");
            } else if ($ele.hasClass(self.tpl.elementBuilderClass)) {
                if (multi) {
                    $ele.toggleClass("active-working");
                    self.workingOn = self.$doc.find(".active-working");
                } else {
                    $prevElements.not($ele).removeClass("active-working");
                    $ele.toggleClass("active-working");
                    self.workingOn = $ele.hasClass("active-working") ? $ele : self.$doc;
                }
            }
            //Fire event:
            raiseEvent(self.workingOn.hasClass("active-working") ? eventNames.selectedElement : eventNames.selectedRoot);
        };

        let currentWorking = function() {
            return self.workingOn != "" && self.workingOn.length ? self.workingOn : null;
        };
        let recoverState = function(op = "undo") {
            if (op === "undo" && states.pos >= states.stack.length - 1) {
                states.push();
                states.pos = states.stack.length - 2;
            } else if (op === "undo" && states.pos > -1) {
                states.pos--;
            }
            if (op === "redo" && states.pos <= -1 && states.stack.length) {
                states.pos = 1;
            } else if (op === "redo" && states.pos < states.stack.length - 1) {
                states.pos++;
            }
            let restore = states.get();
            if (restore) {
                /* SH: added - 2021-06-25 => this will restore head includes and all -> will be remade and broken into pieces later */
                //self.$frame.find("head").html(restore.doc.head);
                self.$doc.html(restore.doc.body);
                self.workingOn = self.$doc.find(".active-working");
                raiseEvent(self.workingOn.hasClass("active-working") ? eventNames.selectedElement : eventNames.selectedRoot);
                if (op === "undo" && states.pos === 0) {
                    states.pos = -1;
                }
                return true;
            }
            return false;
        }
        let copyElement = function(_ele = null) {
            let $eles = $(_ele ?? this.currentWorking());
            if ($eles.hasClass(self.tpl.elementBuilderClass)) {
                setClipboard($eles.clone(true).removeClass("active-working"),"copy");
                raiseEvent(eventNames.copyElement, clipboard.el);
            }
        };
        let cropElement = function(_ele = null) {
            let $eles = $(_ele ?? this.currentWorking());
            if ($eles.hasClass(self.tpl.elementBuilderClass)) {
                setClipboard($eles.detach().removeClass("active-working"), "crop");
                raiseEvent(eventNames.cropElement, clipboard.el);
                setCurrentWorking(); // will set root;
            }
        };
        let setClipboard = function(data, event) {
            if (event != "erase") {
                clipboard = { 
                    el : data, 
                    ev : event 
                };
                raiseEvent(eventNames.clipboardHasValue);
            } else {
                clipboard = null;
                raiseEvent(eventNames.clipboardNowEmpty);
            }
        }
        let pasteElement = function(_toEle = null) {
            let $toEle = $(_toEle ?? this.currentWorking());
            if (clipboard && $toEle.length) {
                let $eles = clipboard.el.clone(true);
                if (clipboard.ev == "crop") {
                    $toEle.append($eles);
                    $eles.each((i,el) => $(el).trigger("click"));
                    setClipboard(null, "erase");
                } else {
                    $toEle.append($eles);
                    raiseEvent([eventNames.pasteElement],$eles);
                }
                
            }
        };
        let removeElement = function(_rem = null) {
            let $rem = $(_rem ?? this.currentWorking());
            if ($rem.hasClass(self.tpl.elementBuilderClass)) {
                let structNext   = $rem.next(`.${self.tpl.elementBuilderClass}`).not($rem);
                let structParent = $rem.parent().closest(`.${self.tpl.elementBuilderClass}`);
                $rem.remove();
                raiseEvent(eventNames.removeElement, $rem);
                if (structNext.length) {
                    structNext.eq(0).trigger("click");
                } else if (structParent.length) {
                    structParent.eq(0).trigger("click");
                } else {
                    self.$doc.trigger("click");
                }
            }
        };
        //let eleMove = function(dir, ele, upIfNone = true)
        let moveElement = function(dir) {
            let $eles = this.currentWorking();
            if (eleMove(dir, $eles, true)) {
                raiseEvent(eventNames.moveElement, $eles.get(), dir);
            }
        };


        self.addElement = function(group = "basic", element = "container", _to = "") {
            let $to = _to != "" ? $(_to) : self.$doc;
            let $appended = null;
            if (self.elements[group] && self.elements[group].elements[element]) {
                $appended = $(
                    self.elements[group].elements[element].html.replace("%build%", self.tpl.elementBuilderClass)
                ).appendTo($to);
                tagElement($appended, element);
            } else {
                console.warn("Tried to add an undefined element");
            }
            return;
        };

        let toggleBuilderStyleView = function(view = "toggle") {
            switch (view) {
                case "show":
                    self.$frame.find("html").addClass(self.settings.viewTogglerClass);
                    break;
                case "hide":
                    self.$frame.find("html").removeClass(self.settings.viewTogglerClass);
                    break;
                case "toggle":
                    self.$frame.find("html").toggleClass(self.settings.viewTogglerClass);
                    break;
            }
            raiseEvent(
                self.$frame.find("html").hasClass(self.settings.viewTogglerClass) 
                ? eventNames.viewStateBuilder 
                : eventNames.viewStateNormal
            );
        };

        self.toggleToolbar = function(from, which) {
            let $toShow = self.$toolbars.filter("[data-name='" + which + "']");
            if ($toShow.length) {
                self.$toolbars.not($toShow).hide();
                self.$controls.filter("[data-run='openToolbar']").removeClass("selected");
                if ($toShow.is(":visible")) {
                    $toShow.hide();
                } else {
                    $toShow.show();
                    $(from).addClass("selected");
                }
            }
        };
        //Attach Iframe styles 
        let pushCoreStyles = function() {
            //Set Libraries:
            self.loadLibraries(self.settings.libraries);
            //Add Toggler:
            let rules = [];
            $.each(documentStyle, function(i, rule) {
                rules.push("html." + self.settings.viewTogglerClass + " " + rule);
            });
            self.$frame.find("head").eq(0).append(
                "<style>" + rules.join('\n') + "</style>"
            );
        };

        //Load library 
        self.loadLibraries = function(libs) {
            let loaded = self.$frame.find("link");
            $.each(libs, function(i, lib) {
                if (typeof registeredLibraries[lib] != 'string')
                    return;
                if (self.$frame.find("link[rel='" + registeredLibraries[lib] + "']").length == 0) {
                    self.$frame.find("head").eq(0).append(
                        "<link type='text/css' rel='stylesheet' href='" + registeredLibraries[lib] + "' />"
                    );
                }
            });
        };

        //Get text from language:
        let getText = function(category, which, defaultReturn = "") {
            if (self.loadedLanguage.hasOwnProperty(category) && self.loadedLanguage[category].hasOwnProperty(which)) {
                return self.loadedLanguage[category][which];
            }
            return defaultReturn;
        };

        //Build base main controls:
        let buildMainControls = function() {
            //Unpack:
            let packs = [];
            for (const pack in self.coreControls) {
                packs.push({ 
                    group : pack, 
                    order : self.coreControls[pack].order, 
                    controls : self.coreControls[pack].controls 
                });
            }
            //Sort for order:
            packs.sort((a, b) => a.order - b.order);
            //Build controls and create them:
            for (const i in packs) {
                let group = packs[i];
                let controls = [];
                for (const control in group.controls) {
                    controls.push({ name : control, order : group.controls[control].order });
                }
                controls.sort((a, b) => a.order - b.order);
                for (const i in controls) {
                    addControlTo(group.controls[controls[i].name], self.$mainControlsContainer, controls[i].name);
                }
            }
        };
        //Build base elements pack controls:
        let buildElementsControls = function() {
            //Unpack:
            let packs = [];
            for (const pack in self.elements) {
                packs.push({ group : pack, order : self.elements[pack].control.order });
            }
            //Sort for order:
            packs.sort((a, b) => a.order - b.order);
            //Build controls and controls toolbars:
            for (const i in packs) {
                let group = self.elements[packs[i].group];
                addControlTo(group.control, self.$mainControlsContainer);
                //Add toolbar if needed:
                if (group.control.run === "openToolbar") {
                    let $newToolbar = addToolbar(group.control);
                    //Unpack elements:
                    let definitions = [];
                    for (const element in group.elements) {
                        definitions.push({ definition : element, order : group.elements[element].order });
                    }
                    definitions.sort((a, b) => a.order - b.order);
                    for (const j in definitions) {
                        let def = definitions[j].definition;
                        addControlTo(
                            $.extend({}, group.elements[def],
                                { run : "addElement", params : [packs[i].group, def]}
                            ),
                            $newToolbar
                        );
                    }
                }
            }
        };

        let addControlTo = function(control, $to, definitionName = "") {
            control.run = control.run ?? "";
            let commandStr = control.run;
            control.params  = control.params ?? [];
            control.icon    = control.icon ?? "fas fa-question";
            control.state   = (control.state ?? true) ? "" : "disabled-control";
            control.stateOn = control.stateOn ?? "";
            control.stateOff = control.stateOff ?? "";
            let name    = "";
            let title   = "";
            let $newControl;
            if (control.lang && control.lang[self.settings.languagePack]) {
                title = control.lang[self.settings.languagePack].desc ?? "";
                name = control.lang[self.settings.languagePack].name ?? "";
            } else {
                title = control.desc ?? "";
                name = control.name ?? "";
            }
            if (typeof control.run === "function") {
                commandStr = "func";
            }
            if (definitionName === "devider") {
                $newControl = $(self.tpl.controlsDevider);
            } else {
                $newControl = $(`
                    <li 
                        data-run="${commandStr}" 
                        data-params=""  
                        data-stateon="${control.stateOn}" 
                        data-stateoff="${control.stateOff}" 
                        title="${title}" 
                        class="${control.state}" >
                        <i class="${control.icon}"></i>
                        <small>${name}</small>
                    </li>
                `);
                $newControl.attr("data-params", JSON.stringify(control.params));
                attachControlEvent($newControl, control.run);
            }

            $newControl.data("definition", control);
            $newControl.appendTo($to);
            self.$controls.push.apply(self.$controls, $newControl);
            return $newControl
        };

        let addToolbar = function(control) {
            let $newToolbar = $(`
                <ul class="toolbar" data-name="${(control.toolbarName ?? "")}">
                </ul>
            `);
            $newToolbar.appendTo(self.$toolbarControlsContainer);
            self.$toolbars.push.apply(self.$toolbars, $newToolbar);
            return $newToolbar;
        };

        //Attach Controls:
        let attachControlEvent = function($control, userFunc) {
            if (typeof userFunc === "function") {
                $control.on("click", function() {
                    if ($(this).hasClass("disabled-control")) return;
                    if ($(this).data("definition").saveBefore) {
                        self.saveState();
                    }
                    let params = $(this).clone().data("params") ?? [];
                    params.unshift(this);
                    userFunc.apply(self, params);
                });
            } else {
                $control.on("click", function() {
                    if ($(this).hasClass("disabled-control")) return;
                    let handler = self.handlers[$(this).data("run")];
                    let params = $(this).clone().data("params") ?? [];
                    if ($(this).data("definition").saveBefore) {
                        self.saveState();
                    }
                    if (typeof handler === "function") {
                        params.unshift(this);
                        handler.apply(self, params);
                    }
                });
            }
        };

        let attachDocumentEvents = function() {
            //Selecting elements for edits:
            self.$doc.on("click", function(ev){
                self.setCurrentWorking(this, ev.ctrlKey);
                messageBar("working-on");
            });
            self.$doc.on("click", `.${self.tpl.elementBuilderClass}`, function(ev) {
                ev.stopPropagation();
                self.setCurrentWorking(this, ev.ctrlKey);
                messageBar("working-on");
            });
        };

        // private methods
        let tagElement = function(_el, name = "") {
            let $el = $(_el);
            let $tagging = $el.find("." + self.tpl.taggingClass);
            if (!$tagging.length) {
                $tagging = $(
                    self.tpl.tagging.replace("%class%", self.tpl.taggingClass)
                                     .replace("%tag%", ""))
                                     .appendTo($el);
            }
        };

        let toggleControls = function(_events) {
            let events = Array.isArray(_events) ? _events : [_events];
            for (const i in events) {
                //Set states:
                let enableControls = self.$controls.filter(`[data-stateon~='${events[i]}']`);
                let disableControls = self.$controls.filter(`[data-stateoff~='${events[i]}']`);
                enableControls.removeClass("disabled-control");
                disableControls.addClass("disabled-control");
                //Set icons:
                self.$controls.each(function() {
                    let $con = $(this);
                    let definition = $con.data("definition").iconStates ?? false;
                    if (definition && Array.isArray(definition)) {
                        for (const j in definition) {
                            if (definition[j].events && definition[j].events.includes(events[i])) {
                                $con.find("i").attr("class", definition[j].type);
                                return;
                            }
                        }
                    }
                });
            }
        };

        // Update Working on bar:
        let messageBar = function(type, mes = "", icon = "") {
            let $icon = self.$workingHeader.find(">small>i").eq(0);
            let $message = self.$workingHeader.find(">small>.message-general").eq(0);
            let $info = self.$workingHeader.find(">small>.message-info").eq(0);
            switch (type) {
                case "custom": {
                    $icon.attr("class", icon);
                    $message.text(mes);
                    $info.text("");
                } break;
                case "working-on": {
                    $icon.attr("class", self.settings.style.messageBar.editingIcon);
                    $message.text(getText("messageBar", "workingOnMessage"));
                    let element = currentWorking();
                    let elTag = element.prop("tagName");
                    let elId = (element.attr("id") ?? "").trim();
                    let elClass = (element.attr("class") ?? "")
                                    .replace(self.tpl.elementBuilderClass,"")
                                    .replace("active-working","")
                                    .trim()
                    $info.text(
                        (elTag + 
                        (elId !== "" ? "#" + elId : "") + 
                        (elClass !== "" ? "." + elClass.split(" ").join(".") : "")).toLocaleLowerCase()
                    );
                } break;
            }
        };

        //Export methods api:
        self.eventNames             = eventNames;
        self.setCurrentWorking      = setCurrentWorking;
        self.currentWorking         = currentWorking;
        self.messageBar             = messageBar;
        self.recoverState           = function(dir) {
            recoverState(dir); 
            states.raise();
        };
        self.copyElement            = copyElement;
        self.cropElement            = cropElement;
        self.pasteElement           = pasteElement;
        self.removeElement          = removeElement;
        self.moveElement            = moveElement;

        self.toggleBuilderStyleView = toggleBuilderStyleView;
        self.attachEventListener    = attachEventListener;
        self.detachEventListener    = detachEventListener;
        self.detachEventListener    = detachEventListener;
        self.getState               = states.create;
        self.saveState              = function() {
            if (states.push()) states.raise();
        };
            
        //Initialize:
        return init();
    };

    //Prototypes helper tools:
    Object.defineProperty(String.prototype, 'hashCode', {
        enumerable: false,
        value: function() {
            let hash = 0, chr;
            if (this.length === 0) return hash;
            for (let i = 0; i < this.length; i++) {
              chr   = this.charCodeAt(i);
              hash  = ((hash << 5) - hash) + chr;
              hash |= 0; // Convert to 32bit integer
            }
            return hash;
        }
    });

    Object.defineProperty(Array.prototype, 'getLast', {
        enumerable: false,
        value: function(){
            return this[this.length - 1];
        }
    });
    
    //Prototypes - Mainly for convenience and naming and backword compatability:
    PageBuilder.prototype.addEventListener = function(type, handler = function(){}) {
        this.attachEventListener(type, handler);
        return this;
    };
    PageBuilder.prototype.removeEventListener = function(type) {
        this.detachEventListener(type);
        return this;
    };
    PageBuilder.prototype.hasEventName = function(eventName = "") {
        return Object.values(this.eventNames).filter((name)=> name === eventName).length ? true : false;
    };
    $.SikPageBuilder.build =  PageBuilder;

})(jQuery);