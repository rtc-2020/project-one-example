function findUniqueObjects(new_array,base_array,property) {
  return new_array.filter(function(new_obj) {
    return !base_array.find(function(base_obj) {
      return new_obj[property] === base_obj[property];
    });
  });
}

module.exports = {
  findUniqueObjects
}
