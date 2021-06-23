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
            viewStateBuilder    : "viewstate-builder",
            viewStateNormal     : "viewstate-normal",
            clipboardHasValue   : "clipboard-has",
            clipboardNowEmpty   : "clipboard-empty",
            copyElement         : "element-copy",
            cropElement         : "element-crop",
            pasteElement        : "element-paste",
            removeElement       : "element-remove",
            selectedElement     : "selected-element",
            selectedRoot        : "selected-root",
            moveElement         : "move-element"
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
        let eleMove = function(dir, ele, upIfNone = true) {
            let $cur  = $(ele);
            let $prev = $cur.prev(`.${self.tpl.elementBuilderClass}`);
            let $next = $cur.next(`.${self.tpl.elementBuilderClass}`);
            let $parent = $cur.parent().closest(`.${self.tpl.elementBuilderClass}`);
            let moved = false;
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
            return moved !== false;
        }

        /************************************************************************************
         * PUBLIC ACTION METHODS
         ***********************************************************************************/
        // public methods
        let setCurrentWorking = function(_ele = null) {
            let $ele = $(_ele ?? self.$doc);
            let $prevElements = self.$doc.find(`.${self.tpl.elementBuilderClass}`);
            //Check if its root:
            if (self.$doc.get(0) === $ele.get(0)) {
                self.workingOn = self.$doc;
                $prevElements.removeClass("active-working");
            } else if ($ele.hasClass(self.tpl.elementBuilderClass)) {
                $prevElements.not($ele).removeClass("active-working");
                $ele.toggleClass("active-working");
                self.workingOn = $ele.hasClass("active-working") ? $ele : self.$doc;
            }
            //Fire event:
            raiseEvent(self.workingOn.hasClass("active-working") ? eventNames.selectedElement : eventNames.selectedRoot);
        };

        let currentWorking = function() {
            return self.workingOn != "" && self.workingOn ? self.workingOn : null;
        };
        let copyElement = function(_ele = null) {
            let ele = $(_ele ?? this.currentWorking());
            if (ele.hasClass(self.tpl.elementBuilderClass)) {
                setClipboard(ele.clone(true).removeClass("active-working"),"copy");
                raiseEvent(eventNames.copyElement, clipboard.el);
            }
        };
        let cropElement = function(_ele = null) {
            let ele = $(_ele ?? this.currentWorking());
            if (ele.hasClass(self.tpl.elementBuilderClass)) {
                setClipboard(ele.detach().removeClass("active-working"), "crop");
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
                let el = clipboard.el.clone(true);
                if (clipboard.ev == "crop") {
                    $toEle.append(el);
                    el.trigger("click");
                    setClipboard(null, "erase");
                } else {
                    $toEle.append(el);
                }
                raiseEvent(eventNames.pasteElement, el);
            }
        };
        let removeElement = function(_rem = null) {
            let $rem = $(_rem ?? this.currentWorking());
            if ($rem.hasClass(self.tpl.elementBuilderClass)) {
                let structNext   = $rem.parent().find(`>.${self.tpl.elementBuilderClass}`).not($rem);
                let structParent = $rem.parent().closest(`.${self.tpl.elementBuilderClass}`);
                $rem.remove();
                raiseEvent(eventNames.removeElement, $rem);
                if (structNext.length) {
                    structNext.eq(0).trigger("click");
                } else if (structParent.length) {
                    structParent.trigger("click");
                } else {
                    self.$doc.trigger("click");
                }
            }
        };
        //let eleMove = function(dir, ele, upIfNone = true)
        let moveElement = function(dir) {
            let $ele = this.currentWorking();
            if (eleMove(dir, $ele, true)) {
                raiseEvent(eventNames.moveElement, $ele.get(0), dir);
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
                    let params = $(this).clone().data("params") ?? [];
                    params.unshift(this);
                    userFunc.apply(self, params);
                });
            } else {
                $control.on("click", function() {
                    let handler = self.handlers[$(this).data("run")];
                    let params = $(this).clone().data("params") ?? [];
                    if (typeof handler === "function") {
                        params.unshift(this);
                        handler.apply(self, params);
                    }
                });
            }
        };

        let attachDocumentEvents = function() {
            //Selecting elements for edits:
            self.$doc.on("click", function(){
                self.setCurrentWorking(this);
                messageBar("working-on");
            });
            self.$doc.on("click", `.${self.tpl.elementBuilderClass}`, function(ev) {
                ev.stopPropagation();
                self.setCurrentWorking(this);
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
        self.copyElement            = copyElement;
        self.cropElement            = cropElement;
        self.pasteElement           = pasteElement;
        self.removeElement          = removeElement;
        self.moveElement            = moveElement;

        self.toggleBuilderStyleView = toggleBuilderStyleView;
        self.attachEventListener    = attachEventListener;
        self.detachEventListener    = detachEventListener;
        //Initialize:
        return init();
    };

    //Prototypes - mainly for convenience and naming like compatability:
    PageBuilder.prototype.addEventListener = function(type, handler = function(){}) {
        this.attachEventListener(type, handler);
        return this;
    };
    PageBuilder.prototype.removeEventListener = function(type, handler = function(){}) {
        this.detachEventListener(type, handler);
        return this;
    };
    PageBuilder.prototype.hasEventName = function(eventName = "") {
        return Object.values(this.eventNames).filter((name)=> name === eventName).length ? true : false;
    }
    $.SikPageBuilder.build =  PageBuilder;

})(jQuery);