(function( $ ){
    "use strict";

    $.fn.buttonsSet = function(set) {
        var dataset = set || [
            { "label":"Do", "value":"0" },
            { "label":"Lu", "value":"1" },
            { "label":"Ma", "value":"2" },
            { "label":"Mi", "value":"3" },
            { "label":"Ju", "value":"4" },
            { "label":"Vi", "value":"5" },
            { "label":"Sa", "value":"6" }
        ];

        return this.each(function(){
            var field = $("input", this);
            var currentSet = field.val().split(",");
            for(var i = 0; i < dataset.length; i++) {
                for(var n = 0; n < currentSet.length; n++) {
                    if(!dataset[i].checked) {
                        dataset[i].checked = (dataset[i].value == currentSet[n]);
                    }
                }
            }

            var buttonsSet = $("<div>", {class:"buttonsdataset"});
            for(var i=0; i < dataset.length; i++) {
                var set = dataset[i];
                var id = "dataset"+set.label+n;

                var checked = (set.checked) ? 'checked="checked"' : "";
                var classname = (set.checked) ? "primary" : "light";
                $("<span>", {class:"buttonsetbtn"})
                    .html($("<input>", {type:"checkbox", id:id, value:(set.value), class:"d-none"}).prop("checked", checked))
                    .append($("<label>", {for:id, class:"btn btn-"+classname}).text(set.label))
                    .append("&nbsp;&nbsp;")
                    .click(function(e) {
                        var span = $(this);
                        var chkbox = $("input[type=checkbox]", span);
                        var label = $("label", span);
                        if(chkbox.prop("disabled")==false) {
                            if(!chkbox.prop("checked")) {
                                chkbox.prop("checked", true);
                                label.removeClass("btn-light");
                                label.addClass("btn-primary");
                            } else {
                                chkbox.prop("checked", false);
                                label.removeClass("btn-primary");
                                label.addClass("btn-light");
                            }
                            updateField(field, buttonsSet);
                        }
                    })
                    .appendTo(buttonsSet)
            }
            buttonsSet.insertAfter(field);
            
            function updateField(field, buttonsSet) {
                var values = [];
                $("input[type=checkbox]", buttonsSet).each(function () {
                    if(this.checked) { values.push($(this).val()); }
                });
                field.val(values.join(",")).change();
            }
        });
    }
})(jQuery);