window.addEventListener(
  "load",
  function ()  {
    // javascript enabled ..
    document.body.removeChild(document.body.children[0]);
    // Prepare the dictionary ..
    //Edict.entries.sort(Edict.sortByReading);
    Edict.makeIndex();
    // EdictBrowser.app ..
    var eb = new EdictBrowser();
    eb.page.pageForward();
    // EDICT version ..
    EdictBrowser.structure.
      writeStatus(
        eb,
        { msg: "EDICT2\u00a9 " +
          Edict.version.substr(Edict.version.length - 20, 19) }
      );
  }
);
