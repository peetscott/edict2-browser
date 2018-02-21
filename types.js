var types =  { };

types.baseType = function (base, type)  {
  function Proto()  {  }
  Proto.prototype = base.prototype;
  type.prototype = new Proto();
  type.prototype.constructor = type;
}