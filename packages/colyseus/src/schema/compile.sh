#!/bin/bash

rm -rf lots-unity-schemas/

for file in rooms/*.ts; do
    # Run the command with the current file
    schema-codegen $file --output ./lots-unity-schemas/ --csharp
done


zip -r lots-unity-schemas.zip lots-unity-schemas/