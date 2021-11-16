/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** i18n JS

----------------------------------------------*/

$(function() {
    'use strict';

    // For Language Select
    var changeText = $('.card-localization .card-text')

    var lngObj = {
        en : "Cake sesame snaps cupcake gingerbread danish I love gingerbread. Apple pie pie jujubes chupa chups muffin halvah lollipop. Chocolate cake oat cake tiramisu marzipan sugar plum. Donut sweet pie oat cake dragÃ©e fruitcake cotton candy lemon drops. Cake sesame snaps cupcake gingerbread danish I love gingerbread. Apple pie pie jujubes chupa chups muffin halvah lollipop. Chocolate cake oat cake tiramisu marzipan sugar plum. Donut sweet pie oat cake dragÃ©e fruitcake cotton candy lemon drops. Chocolate cake oat cake tiramisu marzipan sugar plum. Donut sweet pie oat cake dragÃ©e fruitcake cotton candy lemon drops. Cake sesame snaps cupcake gingerbread danish I love gingerbread. cotton candy lemon drops. Cake sesame snaps cupcake gingerbread danish I love gingerbread.",

        pt: "O sÃ©samo do bolo agarra dinamarquÃªs do pÃ£o-de-espÃ©cie do queque eu amo o pÃ£o-de-espÃ©cie. Torta de torta de maÃ§Ã£ jujubes chupa chups Â pirulito halvah muffin. Ameixa do aÃ§Ãºcar do maÃ§apÃ£o do tiramisu do bolo da aveia do bolo de chocolate. Donut doce aveia torta  dragÃ©e fruitcake algodÃ£o doce gotas de limÃ£o. O sÃ©samo do bolo agarra dinamarquÃªs do pÃ£o-de-espÃ©cie do queque eu amo o pÃ£o-de-espÃ©cie. Torta de torta de maÃ§Ã£ jujubes chupa chups Â pirulito halvah muffin. Ameixa do aÃ§Ãºcar do maÃ§apÃ£o do tiramisu do bolo da aveia do bolo de chocolate. Donut doce aveia torta  dragÃ©e fruitcake algodÃ£o doce gotas de limÃ£o.agarra dinamarquÃªs do pÃ£o-de-espÃ©cie do queque eu amo o pÃ£o-de-espÃ©cie. Torta de torta de maÃ§Ã£ jujubes chupa chups Â pirulito halvah muffin maÃ§Ã£ jujubes chupa chups. de torta de maÃ§Ã£ jujubes chupa chups Â pirulito halvah muffin maÃ§Ã£ jujubes.",

        fr: "GÃ¢teau au sÃ©same s'enclenche petit pain au pain d'Ã©pices danois J'adore le pain d'Ã©pices. Tarte aux pommes jujubes chupa chups Â muffin halva sucette. Gateau au chocolat gateau d \ 'avoine tiramisu prune sucre. Donut tourte sucrÃ©e gateau dragÃ©e fruit gateau barbe a papa citron gouttes. GÃ¢teau au sÃ©same s'enclenche petit pain au pain d'Ã©pices danois J'adore le pain d'Ã©pices. Tarte aux pommes jujubes chupa chups Â muffin halva sucette. Gateau au chocolat gateau d \ 'avoine tiramisu prune sucre. Donut tourte sucrÃ©e gateau dragÃ©e fruit gateau barbe a papa citron gouttes. tourte sucrÃ©e gateau dragÃ©e fruit gateau barbe a papa citron gouttes. GÃ¢teau au sÃ©same s'enclenche petit pain au pain d'Ã©pices. petit pain au pain d'Ã©pices danois J'adore le pain d'Ã©pices. Tarte aux pommes jujubes chupa chups Â muffin halva sucette. Gateau au chocolat..",

        de: "Kuchen Sesam Snaps Cupcake Lebkuchen dÃ¤nisch Ich liebe Lebkuchen. Apfelkuchen Jujubes Chupa Chups Muffin Halwa Lutscher. Schokoladenkuchen-Haferkuchen-Tiramisumarzipanzuckerpflaume. Donut sÃ¼ÃŸe Torte Hafer Kuchen DragÃ©e Obstkuchen Zuckerwatte Zitronentropfen. Kuchen Sesam Snaps Cupcake Lebkuchen dÃ¤nisch Ich liebe Lebkuchen. Apfelkuchen Jujubes Chupa Chups Muffin Halwa Lutscher. Schokoladenkuchen-Haferkuchen-Tiramisumarzipanzuckerpflaume. Donut sÃ¼ÃŸe Torte Hafer Kuchen DragÃ©e Obstkuchen Zuckerwatte Zitronentropfen. liebe Lebkuchen. Apfelkuchen Jujubes Chupa Chups Muffin Halwa Lutscher. Schokoladenkuchen-Haferkuchen-Tiramisumarzipanzuckerpflaume. Torte Hafer Kuchen DragÃ©e Obstkuchen Zuckerwatte Zitronentropfen. liebe Lebkuchen. Apfelkuchen Jujubes Chupa Chups Muffin."
    }

    // Change Card Text Language On Click
    $(".language-options").on("click", ".radio", function () {
        var selected_lng = $(this).find('.i18n-lang-option').data('lng');
        changeText.html(lngObj[selected_lng]);
    });
})