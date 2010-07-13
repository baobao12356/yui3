YUI.add("datasource-local",function(C){var B=C.Lang,A=function(){A.superclass.constructor.apply(this,arguments);};C.mix(A,{NAME:"dataSourceLocal",ATTRS:{source:{value:null}},_tId:0,issueCallback:function(E){if(E.callback){var D=(E.error&&E.callback.failure)||E.callback.success;if(D){D(E);}}}});C.extend(A,C.Base,{initializer:function(D){this._initEvents();},_initEvents:function(){this.publish("request",{defaultFn:C.bind("_defRequestFn",this),queuable:true});this.publish("data",{defaultFn:C.bind("_defDataFn",this),queuable:true});this.publish("response",{defaultFn:C.bind("_defResponseFn",this),queuable:true});},_defRequestFn:function(E){var D=this.get("source");if(B.isUndefined(D)){E.error=new Error("Local source undefined");}if(E.error){this.fire("error",E);}this.fire("data",C.mix({data:D},E));},_defDataFn:function(G){var E=G.data,F=G.meta,D={results:(B.isArray(E))?E:[E],meta:(F)?F:{}};this.fire("response",C.mix({response:D},G));},_defResponseFn:function(D){A.issueCallback(D);},sendRequest:function(D){D=D||{};var E=A._tId++;this.fire("request",{tId:E,request:D.request,callback:D.callback,cfg:D.cfg||{}});return E;}});C.namespace("DataSource").Local=A;},"@VERSION@",{requires:["base"]});YUI.add("datasource-io",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.mix(A,{NAME:"dataSourceIO",ATTRS:{io:{value:B.io,cloneDefaultValue:false}}});B.extend(A,B.DataSource.Local,{initializer:function(C){this._queue={interval:null,conn:null,requests:[]};},_queue:null,_defRequestFn:function(F){var E=this.get("source"),G=this.get("io"),D=F.request,C=B.mix(F.cfg,{on:{success:function(J,H,I){this.fire("data",B.mix({data:H},I));},failure:function(J,H,I){I.error=new Error("IO data failure");this.fire("error",B.mix({data:H},I));this.fire("data",B.mix({data:H},I));}},context:this,arguments:F});if(B.Lang.isString(D)){if(C.method&&(C.method.toUpperCase()==="POST")){C.data=C.data?C.data+D:D;}else{E+=D;}}G(E,C);return F.tId;}});B.DataSource.IO=A;},"@VERSION@",{requires:["datasource-local","io"]});YUI.add("datasource-get",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.DataSource.Get=B.extend(A,B.DataSource.Local,{_defRequestFn:function(G){var F=this.get("source"),D=this.get("get"),C=B.guid().replace(/\-/g,"_"),E=this.get("generateRequestCallback");this._last=C;YUI.Env.DataSource.callbacks[C]=B.bind(function(H){delete YUI.Env.DataSource.callbacks[C];var I=this.get("asyncMode")!=="ignoreStaleResponses"||this._last===C;if(I){this.fire("data",B.mix({data:H},G));}else{}},this);F+=G.request+E.call(this,C);D.script(F,{autopurge:true,onFailure:B.bind(function(H){H.error=new Error("Script node data failure");this.fire("error",H);},this,G)});return G.tId;},_generateRequest:function(C){return"&"+this.get("scriptCallbackParam")+"=YUI.Env.DataSource.callbacks."+C;}},{NAME:"dataSourceGet",ATTRS:{get:{value:B.Get,cloneDefaultValue:false},asyncMode:{value:"allowAll"},scriptCallbackParam:{value:"callback"},generateRequestCallback:{value:function(){return this._generateRequest.apply(this,arguments);}}}});YUI.namespace("Env.DataSource.callbacks");},"@VERSION@",{requires:["datasource-local","get"]});YUI.add("datasource-function",function(B){var A=B.Lang,C=function(){C.superclass.constructor.apply(this,arguments);};B.mix(C,{NAME:"dataSourceFunction",ATTRS:{source:{validator:A.isFunction}}});B.extend(C,B.DataSource.Local,{_defRequestFn:function(G){var F=this.get("source"),D;if(F){try{D=F(G.request,this,G);this.fire("data",B.mix({data:D},G));}catch(E){G.error=E;this.fire("error",G);}}else{G.error=new Error("Function data failure");this.fire("error",G);}return G.tId;}});B.DataSource.Function=C;},"@VERSION@",{requires:["datasource-local"]});YUI.add("datasource-cache",function(C){var B=function(){};C.mix(B,{NS:"cache",NAME:"dataSourceCacheExtension"});B.prototype={initializer:function(D){this.doBefore("_defRequestFn",this._beforeDefRequestFn);this.doBefore("_defResponseFn",this._beforeDefResponseFn);},_beforeDefRequestFn:function(E){var D=(this.retrieve(E.request))||null;if(D&&D.response){this.get("host").fire("response",C.mix(D,E));return new C.Do.Halt("DataSourceCache extension halted _defRequestFn");}},_beforeDefResponseFn:function(D){if(D.response&&!D.cached){this.add(D.request,D.response,(D.callback&&D.callback.argument));}}};C.namespace("Plugin").DataSourceCacheExtension=B;function A(F){var E=F&&F.cache?F.cache:C.Cache,G=C.Base.create("dataSourceCache",E,[C.Plugin.Base,C.Plugin.DataSourceCacheExtension]),D=new G(F);G.NS="tmpClass";return D;}C.mix(A,{NS:"cache",NAME:"dataSourceCache"});C.namespace("Plugin").DataSourceCache=A;},"@VERSION@",{requires:["datasource-local"]});YUI.add("datasource-jsonschema",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.mix(A,{NS:"schema",NAME:"dataSourceJSONSchema",ATTRS:{schema:{}}});B.extend(A,B.Plugin.Base,{initializer:function(C){this.doBefore("_defDataFn",this._beforeDefDataFn);},_beforeDefDataFn:function(E){var D=(B.DataSource.IO&&(this.get("host") instanceof B.DataSource.IO)&&B.Lang.isString(E.data.responseText))?E.data.responseText:E.data,C=B.DataSchema.JSON.apply(this.get("schema"),D);if(!C){C={meta:{},results:D};}this.get("host").fire("response",B.mix({response:C},E));return new B.Do.Halt("DataSourceJSONSchema plugin halted _defDataFn");}});B.namespace("Plugin").DataSourceJSONSchema=A;},"@VERSION@",{requires:["plugin","datasource-local","dataschema-json"]});YUI.add("datasource-xmlschema",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.mix(A,{NS:"schema",NAME:"dataSourceXMLSchema",ATTRS:{schema:{}}});B.extend(A,B.Plugin.Base,{initializer:function(C){this.doBefore("_defDataFn",this._beforeDefDataFn);},_beforeDefDataFn:function(E){var D=(B.DataSource.IO&&(this.get("host") instanceof B.DataSource.IO)&&E.data.responseXML&&(E.data.responseXML.nodeType===9))?E.data.responseXML:E.data,C=B.DataSchema.XML.apply(this.get("schema"),D);if(!C){C={meta:{},results:D};}this.get("host").fire("response",B.mix({response:C},E));
return new B.Do.Halt("DataSourceXMLSchema plugin halted _defDataFn");}});B.namespace("Plugin").DataSourceXMLSchema=A;},"@VERSION@",{requires:["plugin","datasource-local","dataschema-xml"]});YUI.add("datasource-arrayschema",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.mix(A,{NS:"schema",NAME:"dataSourceArraySchema",ATTRS:{schema:{}}});B.extend(A,B.Plugin.Base,{initializer:function(C){this.doBefore("_defDataFn",this._beforeDefDataFn);},_beforeDefDataFn:function(E){var D=(B.DataSource.IO&&(this.get("host") instanceof B.DataSource.IO)&&B.Lang.isString(E.data.responseText))?E.data.responseText:E.data,C=B.DataSchema.Array.apply(this.get("schema"),D);if(!C){C={meta:{},results:D};}this.get("host").fire("response",B.mix({response:C},E));return new B.Do.Halt("DataSourceArraySchema plugin halted _defDataFn");}});B.namespace("Plugin").DataSourceArraySchema=A;},"@VERSION@",{requires:["plugin","datasource-local","dataschema-array"]});YUI.add("datasource-textschema",function(B){var A=function(){A.superclass.constructor.apply(this,arguments);};B.mix(A,{NS:"schema",NAME:"dataSourceTextSchema",ATTRS:{schema:{}}});B.extend(A,B.Plugin.Base,{initializer:function(C){this.doBefore("_defDataFn",this._beforeDefDataFn);},_beforeDefDataFn:function(E){var D=(B.DataSource.IO&&(this.get("host") instanceof B.DataSource.IO)&&B.Lang.isString(E.data.responseText))?E.data.responseText:E.data,C=B.DataSchema.Text.apply(this.get("schema"),D);if(!C){C={meta:{},results:D};}this.get("host").fire("response",B.mix({response:C},E));return new B.Do.Halt("DataSourceTextSchema plugin halted _defDataFn");}});B.namespace("Plugin").DataSourceTextSchema=A;},"@VERSION@",{requires:["plugin","datasource-local","dataschema-text"]});YUI.add("datasource-polling",function(B){function A(){this._intervals={};}A.prototype={_intervals:null,setInterval:function(D,E){var C=B.later(D,this,this.sendRequest,[E],true);this._intervals[C.id]=C;return C.id;},clearInterval:function(D,C){D=C||D;if(this._intervals[D]){this._intervals[D].cancel();delete this._intervals[D];}},clearAllIntervals:function(){B.each(this._intervals,this.clearInterval,this);}};B.augment(B.DataSource.Local,A);},"@VERSION@",{requires:["datasource-local"]});YUI.add("datasource",function(A){},"@VERSION@",{use:["datasource-local","datasource-io","datasource-get","datasource-function","datasource-cache","datasource-jsonschema","datasource-xmlschema","datasource-arrayschema","datasource-textschema","datasource-polling"]});