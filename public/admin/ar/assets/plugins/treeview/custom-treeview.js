/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Treeview JS

----------------------------------------------*/

$(function() {
    'use strict';

    $(document).ready(function () {
        var e = "#333333",
            t = "#8280FD",
            a = "#fff",
            l = [
                    {
                        text: "Parent Levels 01",
                        href: "#parent1",
                        tags: ["4"],
                        nodes: [
                            {
                                text: "Second Level 01",
                                href: "#child1",
                                tags: ["2"],
                                nodes: [
                                    { text: "Third Level 01", href: "#grandchild1", tags: ["0"] },
                                    { text: "Third Level 02", href: "#grandchild2", tags: ["0"] },
                                ],
                            },
                            { text: "Second Level 02", href: "#child2", tags: ["0"] },
                        ],
                    },
                    { text: "Parent Levels 02", href: "#parent2", tags: ["0"] },
                    { text: "Parent Levels 03", href: "#parent3", tags: ["0"] },
                    { text: "Parent Levels 04", href: "#parent4", tags: ["0"] },
                    { text: "Parent Levels 05", href: "#parent5", tags: ["0"] },
                ],
            o = [
                    {
                        text: "Parent Levels 01",
                        tags: ["2"],
                        nodes: [
                            {
                                text: "Second Levels 01",
                                tags: ["2"],
                                nodes: [
                                    { text: "Third Levels 01", tags: ["0"] },
                                    { text: "Third Levels 02", tags: ["0"] },
                                    { text: "Third Levels 03", tags: ["0"] },
                                ],
                            },
                            { 
                                text: "Second Levels 02", 
                                tags: ["3"],
                                nodes: [
                                    { text: "Third Levels 01", tags: ["0"] },
                                    { text: "Third Levels 02", tags: ["0"] },
                                ],
                            },
                        ],
                    },
                    { text: "Parent Levels 02", tags: ["7"] },
                    { text: "Parent Levels 03", href: "#demo", tags: ["11"] },
                    { text: "Parent Levels 04", href: "/index.html", tags: ["19"], selected: !0 },
                    { text: "Parent Levels 05", href: "http://www.pixinvent.com", tags: ["0", "available"] },
                ];
    
    
            $("#default-treeview").treeview({
                selectedBackColor: [e],
                data: l,
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                color: [e],
                showBorder: false,
            }),
            $("#custom-icon-treeview").treeview({ 
                selectedBackColor: [e], 
                color: [e], 
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                nodeIcon: "icofont-navigation-menu",
                data: l,
                showBorder: false,
            }),
            $("#tags-badge-treeview").treeview({ 
                selectedBackColor: [e], 
                color: [e], 
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                showTags: !0,
                showBorder: false,
                data: l 
            }),
            $("#with-border-treeview").treeview({ 
                selectedBackColor: [e], 
                color: [e], 
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                showBorder: !0,
                data: l
            }),
            $("#colorful-treeview").treeview({
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                nodeIcon: "icofont-navigation-menu",
                color: [a],
                backColor: [t],
                onhoverColor: ["rgba(255, 255, 255, 0.1)"],
                showBorder: !1,
                showTags: !0,
                highlightSelected: !0,
                // selectedColor: ["green"],
                selectedBackColor: ["rgba(255, 255, 255, 0.1"],
                data: o,
            });
            
            
            var r = $("#disabled-treeview").treeview({
                selectedBackColor: [e],
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
                data: o,
                showBorder: !1,
    
            });
    
            $("#btn-disable-all").on("click", function (e) {
                r.treeview("disableAll", { silent: $("#chk-disable-silent").is(":checked") });
            }),
    
            $("#btn-enable-all").on("click", function (e) {
                r.treeview("enableAll", { silent: $("#chk-disable-silent").is(":checked") });
            });
    
    
            var i = $("#expandible-tree").treeview({
                selectedBackColor: [e],
                data: o,
                showBorder: false,
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
            });
            $("#btn-expand-all").on("click", function (e) {
                $("#select-expand-all-levels").val();
                i.treeview("expandAll", { levels: 2 });
            }),
    
            $("#btn-collapse-all").on("click", function (e) {
                i.treeview("collapseAll");
            });
    
            
            var s = $("#checkable-tree").treeview({
                selectedBackColor: [e],
                data: o,
                showIcon: true,
                showCheckbox: true,
                showBorder: false,
                expandIcon: "icofont-plus",
                collapseIcon: "icofont-minus",
            });
            $("#btn-check-all").on("click", function (e) {
                s.treeview("checkAll", { silent: $("#chk-check-silent").is(":checked") });
            }),
    
            $("#btn-uncheck-all").on("click", function (e) {
                s.treeview("uncheckAll", { silent: $("#chk-check-silent").is(":checked") });
            });
            
    });
})
