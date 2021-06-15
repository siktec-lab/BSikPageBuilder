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
    if ($.hasOwnProperty("SikPageBuilder")) {
        $.extend(true, $.SikPageBuilder.elements, {
            bootstrap5 : {
                basic : {
                    control : {
                        order: 1,
                        name: "Basic Elements",
                        desc: "Open basic elements toolbar",
                        icon: "fas fa-object-ungroup",
                        run: "openToolbar",
                        params: ["basic-elements"],
                        toolbarName: "basic-elements",
                        lang : {
                            english : { name : "Basic Elements", desc: "Open basic elements toolbar" },
                            french  : { name : "Base Elements", desc: "Open basic elements toolbar" },
                        }
                    },
                    elements : {
                        container: {
                            order: 1,
                            name: "Container",
                            desc: "Basic Simple container",
                            html: "<div class='%build% container'></div>",
                            icon: "fas fa-vector-square",
                            lang : {
                                english : { name : "Container", desc: "Basic Simple container" },
                                french  : { name : "Container", desc: "Basic Simple container" },
                            },
                        },
                        containerFluid: {
                            order: 2,
                            name: "Fluid",
                            desc: "Full width container",
                            html: "<div class='%build% container-fluid'></div>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        row: {
                            order: 3,
                            name: "Row",
                            desc: "Grid row normally placed inside containers",
                            html: "<div class='%build% row'></div>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        col: {
                            order: 4,
                            name: "Column",
                            desc: "Grid column normally placed inside rows",
                            html: "<div class='%build% col'></div>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        header: {
                            order: 5,
                            name: "Heading",
                            desc: "Basic heading element",
                            html: "<h1 class='%build%'></h1>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        paragraph: {
                            order: 6,
                            name: "Paragraph",
                            desc: "Basic paragraph element",
                            html: "<p class='%build%'></p>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        span: {
                            order: 7,
                            name: "Inline Text",
                            desc: "Basic inline text element",
                            html: "<span class='%build%'></span>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        list: {
                            order: 8,
                            name: "List",
                            desc: "Basic list element",
                            html: "<ul class='%build%'><li class='%build%'></li></ul>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        listRow: {
                            order: 9,
                            name: "List Row",
                            desc: "Basic list row element",
                            html: "<li class='%build%'></li>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        },
                        image: {
                            order: 10,
                            name: "List Row",
                            desc: "Basic list row element",
                            html: "<img src='' class='%build%'/>",
                            icon: "fas fa-vector-square",
                            lang : {},
                        }
                    }
                },
                tables : {
                    control : {
                        order: 2,
                        name: "Table Elements",
                        desc: "Open table elements toolbar",
                        icon: "fas fa-th-large",
                        run: "openToolbar",
                        params: ["table-elements"],
                        toolbarName: "table-elements",
                        lang : {
                            english : { name : "Table Elements", desc: "Open table elements toolbar" },
                            french  : { name : "Table Elements", desc: "Open table elements toolbar" },
                        }
                    },
                    elements : {
                        table: {
                            order: 1,
                            name: "Table & header",
                            desc: "Basic Simple container",
                            html: "<table class='%build%'><tr class='%build%'><th class='%build%'></th><th class='%build%'></th><th class='%build%'></th><th class='%build%'></th></tr></table>",
                            icon: "fas fa-th-large",
                            lang : {
                                english : { name : "Table & header", desc: "Simple Table" },
                                french  : { name : "Table & header", desc: "Simple Table" },
                            },
                        },
                    }
                }
            }
        });
    } else {
        console.warn("SikPageBuilder elements definition must be included after the main plugin script");
    }
})(jQuery);