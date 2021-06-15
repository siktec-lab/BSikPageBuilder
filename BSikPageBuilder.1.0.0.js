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
    }
    //The core plugin:
    $.SikPageBuilder["build"] = function(el, options) {
        let self, init;
        self = this;
        self.defaults = {
            libraries:              ["Bootstrap v.5.0.1", "core"],
            viewTogglerClass:       "builder-show",
            elementBuilderClass:    "struct-ele",
            elementTaggingClass:    "sik-tagging",
            languagePack :          "english",
            elementsPack :          "bootstrap5",
            handlers: {
                copyElement: function(el) {
                    let cop = this.currentWorking();
                    return this.copyElement(el, cop);
                },
                cropElement: function(el) {
                    let cop = this.currentWorking();
                    return this.cropElement(el, cop);
                },
                pasteElement: function(el) {
                    let pas = this.currentWorking();
                    return this.pasteElement(el, pas);
                },
                removeElement: function(el) {
                    let rem = this.currentWorking();
                    return this.removeElement(el, rem);
                },
                addElement: function(el, group, which) {
                    let _to = this.currentWorking();
                    return this.addElement(group, which, _to);
                },
                toggleView: function(el) {
                    return this.toggleBuilderStyleView();
                },
                openToolbar: function(el, toolbar) {
                    return this.toggleToolbar(el, toolbar);
                }
            },
            style: {
                messageBar : {
                    editingIcon : "fas fa-pen"
                }
            }
        };
        self.settings = {};
        self.loadedLanguage = {};
        let registeredLibraries = {
            "core":"css/BsikPageBuilderIframe.css",
            "Bootstrap v.5.0.1": "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
        };
        self.elements       = {};
        self.tmpl = {
            taggingClass        : "sik-tagging",
            tagging             : "<div class='%class%'>%tag%</div>",
            elementBuilderClass : "struct-ele"
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
            self.loadedLanguage = $.SikPageBuilder.languages[self.settings.languagePack];
            self.elements = $.SikPageBuilder.elements[self.settings.elementsPack];
            
            //Extend from settings:
            self.tmpl.taggingClass          = self.settings.elementTaggingClass;
            self.tmpl.elementBuilderClass   = self.settings.elementBuilderClass;

            //Build HTML Structure:
            build();
            
            self.$frame = self.$el.find(">.builder-document").eq(0).contents();
            self.$doc = self.$frame.find("body").eq(0);
            self.$workingHeader = self.$el.find(">.working-header").eq(0);
            self.$mainControlsContainer = self.$el.find(">.controls");
            self.$toolbarControlsContainer = self.$el.find(">.toolbar-controls");
            self.workingOn = self.$doc;

            //Add controls:
            buildElementsControls();
            
            //Sets core styles inside the iframe:
            pushCoreStyles();

            //Set builder mode:
            self.toggleBuilderStyleView("show"); /* SH: added - 2021-06-14 => sets builder view should be controlled through the settings */
            //Set working on pointer:
            
            //Attach events of iframe elements:
            attachDocumentEvents();
        };

        let build = function() {
            console.log("build");
            //Create structure:
        };
        // public methods
        self.currentWorking = function() {
            return self.workingOn != "" && self.workingOn ? self.workingOn : null;
        };
        self.copyElement = function(by, _ele) {
            let ele = $(_ele);
            if (ele.hasClass("struct-ele")) {
                setClipboard(ele.clone(true).removeClass("active-working"),"copy");
            }
        };
        self.cropElement = function(by, _ele) {
            let ele = $(_ele);
            if (ele.hasClass("struct-ele")) {
                setClipboard(ele.detach().removeClass("active-working"), "crop");
            }
        };
        let setClipboard = function(data, event) {
            let pasteCommads = self.$controls.filter("[data-run='pasteElement']");
            if (event != "erase") {
                clipboard = { 
                    el : data, 
                    ev : event 
                };
                pasteCommads.removeClass("disabled-control");
            } else {
                clipboard = null;
                pasteCommads.addClass("disabled-control");
            }
        }
        self.pasteElement = function(by, $toEle) {
            if (clipboard && $toEle) {
                if (clipboard.ev == "crop") {
                    $toEle.append(clipboard.el);
                    clipboard.el.trigger("click");
                    setClipboard(null, "erase");
                } else {
                    $toEle.append(clipboard.el.clone(true));
                }
            }
        };
        self.removeElement = function(by, _rem) {
            let rem = $(_rem);
            if (rem.hasClass("struct-ele")) {
                let structNext   = rem.parent().find(">.struct-ele").not(rem);
                let structParent = rem.parent().closest(".struct-ele");
                rem.remove();
                if (structNext.length) {
                    structNext.eq(0).trigger("click");
                } else if (structParent.length) {
                    structParent.trigger("click");
                } else {
                    self.$doc.trigger("click");
                }
            }
        };
        self.addElement = function(group = "basic", element = "container", _to = "") {
            let $to = _to != "" ? $(_to) : self.$doc;
            let $appended = null;
            if (self.elements[group] && self.elements[group].elements[element]) {
                $appended = $(
                    self.elements[group].elements[element].html.replace("%build%", self.tmpl.elementBuilderClass)
                ).appendTo($to);
                tagElement($appended, element);
            } else {
                console.warn("Tried to add an undefined element");
            }
            return;
        };

        self.toggleBuilderStyleView = function(view = "toggle") {
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

        let addControlTo = function(control, $to) {
            let command = control.run ?? "";
            let params  = control.params ?? [];
            let icon    = control.icon ?? "fas fa-question";
            let name   = "";
            let title   = "";
            if (control.lang && control.lang[self.settings.languagePack]) {
                title = control.lang[self.settings.languagePack].desc ?? "";
                name = control.lang[self.settings.languagePack].name ?? "";
            } else {
                title = control.desc ?? "";
                name = control.name ?? "";
            }
            let $newControl = $(`
                <li data-run="${command}" data-params="" title="${title}">
                    <i class="${icon}"></i>
                    <small>${name}</small>
                </li>
            `);
            $newControl.attr("data-params", JSON.stringify(params));
            $newControl.appendTo($to);
            self.$controls.push.apply(self.$controls, $newControl);
            attachControlEvent($newControl);
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
        let attachControlEvent = function($control) {
            $control.on("click", function() {
                let handler = self.settings.handlers[$(this).data("run")];
                let params = $(this).clone().data("params") ?? [];
                if (typeof handler === "function") {
                    params.unshift(this);
                    handler.apply(self, params);
                }
            });
        };

        let attachDocumentEvents = function() {
            //Selecting elements for edits:
            self.$doc.on("click", function(){
                self.workingOn = self.$doc;
                self.$doc.find(".struct-ele").removeClass("active-working");
                messageBar("working-on");
            });
            self.$doc.on("click", ".struct-ele", function(ev) {
                ev.stopPropagation();
                self.workingOn = $(this);
                self.$doc.find(".struct-ele").not(self.workingOn).removeClass("active-working");
                self.workingOn.toggleClass("active-working");
                messageBar("working-on");
            });
            messageBar("working-on");
        };

        // private methods
        let tagElement = function(_el, name = "") {
            let $el = $(_el);
            let $tagging = $el.find("." + self.tmpl.taggingClass);
            if (!$tagging.length) {
                $tagging = $(
                    self.tmpl.tagging.replace("%class%", self.tmpl.taggingClass)
                                     .replace("%tag%", ""))
                                     .appendTo($el);
            }
        };
        // Update Working on bar:
        let messageBar = function(type, mes = "", icon = "") {
            let $icon = self.$workingHeader.find(">small>i").eq(0);
            let $message = self.$workingHeader.find(">small>.message-general").eq(0);
            let $info = self.$workingHeader.find(">small>.message-info").eq(0);
            switch (type) {
                case "working-on": {
                    $icon.attr("class", self.settings.style.messageBar.editingIcon);
                    $message.text(getText("messageBar", "workingOnMessage"));
                    let element = self.currentWorking();
                    let elTag = element.prop("tagName");
                    let elId = (element.attr("id") ?? "").trim();
                    let elClass = (element.attr("class") ?? "").replace("struct-ele","").replace("active-working","").trim()
                    $info.text(
                        (elTag + 
                        (elId !== "" ? "#" + elId : "") + 
                        (elClass !== "" ? "." + elClass.split(" ").join(".") : "")).toLocaleLowerCase()
                    );
                } break;
            }
        };

        init();
    };

})(jQuery);