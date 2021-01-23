- Generic keywords
    - [x] const
    - [x] enum
    - [x] examples

- Type-specific keywords
    - [x] null
    - [x] integer
        - [x] minimum
        - [x] maximum
        - [x] exclusiveMinimum
        - [x] exclusiveMaximum
        - [x] range check
    - [x] number
        - [x] minimum
        - [x] maximum
        - [x] exclusiveMinimum
        - [x] exclusiveMaximum
        - [x] multipleOf
            - [x] multipleOf is `integer`
            - [x] multipleOf is `float`
        - [x] range check
    - [x] boolean
    - [x] string
        - [x] base
            - default `minLength`===0
            - `maxLength = maxLength ?? minLength+10`
        - [ ] `patten`
            - [x] without `formats`
            - [ ] with `formats` will probably conflict
            - [ ] with `minLength` or `maxLength` will probably conflict
        - [ ] `formats`
            - [ ] with `patten` will probably conflict
            - [ ] with `minLength` or `maxLength` will probably conflict
            - Built-in formats
                - [x] `email`
                - [x] `date`
                - [x] `time`
                - [x] `date-time`
                - [x] `uri`
            - extras
                - `url` same as `uri`
                - `protocol` => http'、'ftp' ...
                - `domain` => "kozfnb.org"
                - `ip` => "34.206.109.169"
                - `color` => "#3538B2"
                - `zip` => "908812"
                - `guid` => "662C63B4-FD43-66F4-3328-C54E3FF0D56E"
    - [ ] object
        - [x] no : `required`/`properties`/`patternProperties`/`propertyNames`/`additionalProperties`
        - [x] `minProperties`/`maxProperties`
        - [x] size check
        - [x] `required`
    - [ ] array