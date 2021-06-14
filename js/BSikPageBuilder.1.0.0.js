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
            libraries: ["Bootstrap v.5.0.1"],
            viewTogglerClass: "builder_show",
            handlers: {
                addContainer: function(el) {
                    let _to = this.currentWorking();
                    return this.addElement("container", _to);
                },
                toggleView: function(el) {
                    return this.toggleBuilderStyleView();
                },
                subControl: function(el, sub) {
                    //console.log(el, sub);
                    return this.toggleSubControl(el, sub);
                }
            }
        };
        self.settings = {};
        let registeredLibraries = {
            "Bootstrap v.5.0.1": "https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css"
        }
        let elements = {
            tagging: "<div class='sik_tagging'><span class='sik_tag_name'></span></div>",
            container: "<div class='struct_ele container'><div>",
            containerFluid: "<div class='struct_ele container-fluid'><div>",
            row: "<div class='struct_ele row'><div>",
            col: "<div class='struct_ele col'><div>"
        };
        let documentStyle = [
            "body { padding: 20px; }",
            ".struct_ele { outline:1px solid #d1d8ff; min-height:35px; padding-bottom: 1px; margin-bottom:25px; }",
            ".struct_ele:hover {outline:1px solid blue;}",
            ".struct_ele.active_working {outline:2px solid blue;}",
            ".struct_ele .sik_tagging {font-size: 10px; color: #878787; vertical-align: text-top;}"
        ]
        self.workingOn = "";
        // init
        init = function() {
            //Expend settings:
            self.settings = $.extend(true, {}, self.defaults, options);
            self.el = el;
            self.$el = $(el);
            //Build HTML Structure:
            build();
            //Save core elements:
            self.$frame = self.$el.find(">.builder-document").eq(0).contents();
            self.$doc = self.$frame.find("body").eq(0);
            self.$controls = self.$el.find(">.controls>li");
            self.$subControlsGroups = self.$el.find(">.working-controls>.sub-controls");
            self.$subControls = self.$subControlsGroups.find(">li");
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

        build = function() {
            console.log("build");
            //Create structure:
        };
        // public methods
        self.currentWorking = function() {
            return self.workingOn;
        };
        self.addElement = function(element = "container", _to = "") {
            let $to = _to != "" ? $(_to) : self.$doc;
            switch (element) {
                case "container":
                    console.log("adding container", $to);
                    let $appended = $(elements.container).appendTo($to);
                    tagElement($appended, "container");
                    break;
            }
            return;
        };
        self.toggleBuilderStyleView = function(view = "toggle") {
            switch (view) {
                case "show":
                    console.log("showing builder styles");
                    self.$frame.find("html").addClass(self.settings.viewTogglerClass);
                    break;
                case "hide":
                    console.log("hiding builder styles");
                    self.$frame.find("html").removeClass(self.settings.viewTogglerClass);
                    break;
                case "toggle":
                    console.log("toggle builder styles");
                    self.$frame.find("html").toggleClass(self.settings.viewTogglerClass);
                    break;
            }
        };
        self.toggleSubControl = function(from, which) {
            let toShow = self.$subControlsGroups.filter("[data-name='" + which + "']");
            //console.log(which, self.$subControlsGroups.length, toShow.length);
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
        pushCoreStyles = function() {
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

        //Attach Controls:
        attachControls = function() {
            //Main controls:
            self.$controls.each(function() {
                $(this).on("click", function() {
                    let handler = self.settings.handlers[$(this).data("run")];
                    let params = $(this).clone().data("params") ?? [];
                    console.log(params);
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
                    let params = $(this).data("params") ?? [];
                    if (typeof handler === "function")
                        handler.apply(self, params);
                });
            });
        };
        attachDocumentEvents = function() {
            //Selecting elements for edits:
            self.$doc.on("click", ".struct_ele", function(ev) {
                ev.stopPropagation();
                self.workingOn = $(this);
                self.$doc.find(".struct_ele").not(self.workingOn).removeClass("active_working");
                self.workingOn.toggleClass("active_working");
            });
        };
        // private methods
        tagElement = function(_el, name = "") {
            let $el = $(_el);
            let $tagging = $el.find(".sik_tagging");
            if (!$tagging.length)
                $tagging = $(elements.tagging).appendTo($el);
            if (name)
                $tagging.find("span.sik_tag_name").text(name);
        };

        init();
    };

})(jQuery);