//! JSON helper functions

pub trait JsonifiableTrait<T> {
    fn jsonify(self: T) -> ByteArray;
}

pub impl Jsonifiable<T, +Drop<T>, +core::fmt::Display<T>> of JsonifiableTrait<T> {
    fn jsonify(self: T) -> ByteArray {
        format!("{}", self)
    }
}

#[generate_trait]
pub impl JsonifiableSimple of JsonifiableSimpleTrait {
    fn jsonify(name: ByteArray, value: ByteArray) -> ByteArray {
        format!("\"{}\":{}", name, value)
    }
}

#[generate_trait]
pub impl JsonifiableString of JsonifiableStringTrait {
    fn jsonify(name: ByteArray, value: ByteArray) -> ByteArray {
        format!("\"{}\":\"{}\"", name, value)
    }
}

#[generate_trait]
pub impl JsonifiableArray<T, +JsonifiableTrait<T>, +Drop<T>> of JsonifiableArrayTrait<T> {
    fn jsonify(name: ByteArray, mut value: Array<T>) -> ByteArray {
        let mut string = "[";
        let mut index: u32 = 0;
        while let Option::Some(item) = value.pop_front() {
            if index > 0 {
                string += ",";
            }
            string += item.jsonify();
            index += 1;
        }
        JsonifiableSimple::jsonify(name, string + "]")
    }
}

#[cfg(test)]
mod tests {
    // Local imports

    use super::{
        Jsonifiable, JsonifiableArray, JsonifiableSimple, JsonifiableString, JsonifiableTrait,
    };

    #[derive(Drop)]
    struct BooleanObject {
        value: bool,
    }

    #[derive(Drop)]
    struct IntegerObject {
        value: u8,
    }

    #[derive(Drop)]
    struct FeltObject {
        value: felt252,
    }

    #[derive(Drop)]
    struct ByteArrayObject {
        value: ByteArray,
    }

    #[derive(Drop)]
    struct Complex {
        boolean: bool,
        integer: u8,
        felt: felt252,
        byte_array: ByteArray,
        array: Array<u8>,
        object_array: Array<IntegerObject>,
        object: IntegerObject,
    }

    pub impl IntegerObjectJsonifiable of JsonifiableTrait<IntegerObject> {
        fn jsonify(self: IntegerObject) -> ByteArray {
            let mut string = "{";
            string += JsonifiableSimple::jsonify("value", format!("{}", self.value));
            string + "}"
        }
    }

    pub impl BooleanObjectJsonifiable of JsonifiableTrait<BooleanObject> {
        fn jsonify(self: BooleanObject) -> ByteArray {
            let mut string = "{";
            string += JsonifiableSimple::jsonify("value", format!("{}", self.value));
            string + "}"
        }
    }

    pub impl FeltObjectJsonifiable of JsonifiableTrait<FeltObject> {
        fn jsonify(self: FeltObject) -> ByteArray {
            let mut string = "{";
            string += JsonifiableSimple::jsonify("value", format!("{}", self.value));
            string + "}"
        }
    }

    pub impl ByteArrayObjectJsonifiable of JsonifiableTrait<ByteArrayObject> {
        fn jsonify(self: ByteArrayObject) -> ByteArray {
            let mut string = "{";
            string += JsonifiableString::jsonify("value", format!("{}", self.value));
            string + "}"
        }
    }

    pub impl ComplexJsonifiable of JsonifiableTrait<Complex> {
        fn jsonify(self: Complex) -> ByteArray {
            let mut string = "{";
            string += JsonifiableSimple::jsonify("boolean", format!("{}", self.boolean));
            string += "," + JsonifiableSimple::jsonify("integer", format!("{}", self.integer));
            string += "," + JsonifiableSimple::jsonify("felt", format!("{}", self.felt));
            string += ","
                + JsonifiableString::jsonify("byte_array", format!("{}", self.byte_array));
            string += "," + JsonifiableArray::jsonify("array", self.array);
            string += "," + JsonifiableArray::jsonify("object_array", self.object_array);
            string += "," + JsonifiableSimple::jsonify("object", self.object.jsonify());
            string + "}"
        }
    }

    #[test]
    fn test_jsonify_integer_object() {
        let integer_object = IntegerObject { value: 1 };
        let json = integer_object.jsonify();
        assert_eq!(json, "{\"value\":1}");
    }

    #[test]
    fn test_jsonify_boolean_object() {
        let boolean_object = BooleanObject { value: true };
        let json = boolean_object.jsonify();
        assert_eq!(json, "{\"value\":true}");
    }

    #[test]
    fn test_jsonify_felt_object() {
        let felt_object = FeltObject { value: '1' };
        let json = felt_object.jsonify();
        assert_eq!(json, "{\"value\":49}");
    }

    #[test]
    fn test_jsonify_byte_array_object() {
        let byte_array_object = ByteArrayObject { value: "test" };
        let json = byte_array_object.jsonify();
        assert_eq!(json, "{\"value\":\"test\"}");
    }

    #[test]
    fn test_jsonify_complex() {
        let complex = Complex {
            boolean: true,
            integer: 1,
            felt: '1',
            byte_array: "test",
            array: array![1, 2, 3],
            object_array: array![IntegerObject { value: 1 }, IntegerObject { value: 2 }],
            object: IntegerObject { value: 1 },
        };
        let json = complex.jsonify();
        assert_eq!(
            json,
            "{\"boolean\":true,\"integer\":1,\"felt\":49,\"byte_array\":\"test\",\"array\":[1,2,3],\"object_array\":[{\"value\":1},{\"value\":2}],\"object\":{\"value\":1}}",
        );
    }
}

