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

(function($) {

    $.SikLayout = function(el, options) {
        let self, init, privateMethod;
        self = this;
        self.defaults = {
            libraries: ["Bootstrap v.5.0.1", "core"],
            viewTogglerClass: "builder-show",
            languagePack : "english",
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
                addElement: function(el, which) {
                    let _to = this.currentWorking();
                    return this.addElement(which, _to);
                },
                toggleView: function(el) {
                    return this.toggleBuilderStyleView();
                },
                subControl: function(el, sub) {
                    return this.toggleSubControl(el, sub);
                }
            },
            style: {
                messageBar : {
                    editingIcon : "fas fa-pen"
                }
            }
        };
        self.settings = {};
        let languages = {
            english : {
                messageBar : {
                    workingOnMessage : "Selected:"
                }
                
            }
        }
        self.loadedLanguage = {};
        let registeredLibraries = {
            "core":"css/BsikPageBuilderIframe.css",
            "Bootstrap v.5.0.1": "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
        };
        let elements = {
            tagging: "<div class='sik-tagging'></div>",
            container: "<div class='struct-ele container'></div>",
            containerFluid: "<div class='struct-ele container-fluid'></div>",
            row: "<div class='struct-ele row'></div>",
            col: "<div class='struct-ele col'></div>",
            header: "<h1 class='struct-ele'></h1>",
            paragraph: "<p class='struct-ele'></p>",
            span: "<span class='struct-ele'></span>",
            list: "<ul class='struct-ele'><li class='struct-ele'></li></ul>",
            image: "<img src='' class='struct-ele '/>"
        };
        let documentStyle = [
        ];
        let clipboard = null;
        self.workingOn = "";
        
        // init
        init = function() {
            //Expend settings:
            self.settings = $.extend(true, {}, self.defaults, options);
            self.el = el;
            self.$el = $(el);
            self.loadedLanguage = languages[self.settings.languagePack];
            //Build HTML Structure:
            build();
            //Save core elements:
            self.$frame = self.$el.find(">.builder-document").eq(0).contents();
            self.$doc = self.$frame.find("body").eq(0);
            self.$controls = self.$el.find(">.controls>li");
            self.$subControlsGroups = self.$el.find(">.working-controls>.sub-controls");
            self.$subControls = self.$subControlsGroups.find(">li");
            self.$workingHeader = self.$el.find(">.working-header").eq(0);
            //Sets core styles inside the iframe:
            pushCoreStyles();
            //Set builder mode:
            self.toggleBuilderStyleView("show"); /* SH: added - 2021-06-14 => sets builder view should be controlled through the settings */
            //Set working on pointer:
            self.workingOn = self.$doc;
            //Attach main and sub controls:
            attachControls();
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
        self.addElement = function(element = "container", _to = "") {
            let $to = _to != "" ? $(_to) : self.$doc;
            let $appended = null;
            switch (element) {
                case "container":
                    $appended = $(elements.container).appendTo($to);
                    tagElement($appended, "container");
                break;
                case "container-fluid":
                    $appended = $(elements.containerFluid).appendTo($to);
                    tagElement($appended, "fluid");
                break;
                case "row":
                    $appended = $(elements.row).appendTo($to);
                    tagElement($appended, "row");
                break;
                case "col":
                    $appended = $(elements.col).appendTo($to);
                    tagElement($appended, "col");
                break;
                case "header":
                    $appended = $(elements.header).appendTo($to);
                    tagElement($appended, "header");
                break;
                case "paragraph":
                    $appended = $(elements.paragraph).appendTo($to);
                    tagElement($appended, "para");
                break;
                case "span":
                    $appended = $(elements.span).appendTo($to);
                    tagElement($appended, "span");
                break;
                case "list":
                    $appended = $(elements.list).appendTo($to);
                    tagElement($appended, "list");
                break;
                case "image":
                    $appended = $(elements.image).appendTo($to);
                    //tagElement($appended, "image");
                break;
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

        self.toggleSubControl = function(from, which) {
            let toShow = self.$subControlsGroups.filter("[data-name='" + which + "']");
            if (toShow.length) {
                self.$subControlsGroups.not(toShow).hide();
                self.$controls.filter("[data-run='subControl']").removeClass("selected");
                if (toShow.is(":visible")) {
                    toShow.hide();
                } else {
                    toShow.show();
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

        //Attach Controls:
        let attachControls = function() {
            //Main controls:
            self.$controls.each(function() {
                $(this).on("click", function() {
                    let handler = self.settings.handlers[$(this).data("run")];
                    let params = $(this).clone().data("params") ?? [];
                    //console.log(params);
                    if (typeof handler === "function") {
                        params.unshift(this);
                        handler.apply(self, params);
                    }
                });
            });
            //Sub controls:
            self.$subControls.each(function() {
                $(this).on("click", function() {
                    let handler = self.settings.handlers[$(this).data("run")];
                    let params = $(this).clone().data("params") ?? [];
                    if (typeof handler === "function")
                        params.unshift(this);
                        handler.apply(self, params);
                });
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
            let $tagging = $el.find(".sik-tagging");
            if (!$tagging.length)
                $tagging = $(elements.tagging).appendTo($el);
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