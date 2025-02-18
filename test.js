var markItUpSettings = {
    nameSpace: "default",
    onShiftEnter: {keepDefault:false, replaceWith:'\n\n'},
    markupSet: [
      {name:'Bold', key:'B', openWith:'[b]', closeWith:'[/b]'},
      {name:'Italic', key:'I', openWith:'[i]', closeWith:'[/i]'},
      {name:'Underline', key:'U', openWith:'[u]', closeWith:'[/u]'},
      {separator:'---------------' },
      {name:'Link', key:'L', openWith:'[url=[![Link]!]]', closeWith:'[/url]', placeHolder:'Your text here...'}
    ]
  };
