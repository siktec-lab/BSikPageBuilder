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
        $.extend($.SikPageBuilder.languages, {
            english : {
                messageBar : {
                    workingOnMessage : "Selected:"
                }
            }
        });
    } else {
        console.warn("SikPageBuilder language pack must be included after the main plugin script");
    }
})(jQuery);