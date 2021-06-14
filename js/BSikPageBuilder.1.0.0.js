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
                addContainer: function() {
                    let _to = this.currentWorking();
                    return this.addElement("container", _to);
                },
                toggleView: function() {
                    return this.toggleBuilderStyleView();
                },
                subControl: function(name) {
                    console.log(name);
                    return this.toggleBuilderStyleView();
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
            ".struct_ele.active_wroking {outline:2px solid blue;}",
            ".struct_ele .sik_tagging {font-size: 10px; color: #878787; vertical-align: text-top;}"
        ]
        self.workingOn = "";
        // init
        init = function() {
            self.settings = $.extend(true, {}, self.defaults, options);
            self.el = el;
            self.$el = $(el);
            build();
            self.$frame = self.$el.find(">.builder-document").eq(0).contents();
            self.$doc = self.$frame.find("body").eq(0);
            pushCoreStyles();
            self.toggleBuilderStyleView("show");
            self.workingOn = self.$doc;
            attachControls();
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
            self.$controls = self.$el.find(">.controls>li")
            self.$controls.each(function(i, e) {
                $(e).on("click", function() {
                    let handler = self.settings.handlers[$(this).data("run")];
                    if (typeof handler === "function")
                        handler.apply(self, []);
                });
            });
        };
        attachDocumentEvents = function() {
            //Selecting elemnts for edits:
            self.$doc.on("click", ".struct_ele", function(ev) {
                ev.stopPropagation();
                self.workingOn = $(this);
                self.$doc.find(".struct_ele").not(self.workingOn).removeClass("active_wroking");
                self.workingOn.toggleClass("active_wroking");
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