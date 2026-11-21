# MCP CENTRAL L1 game map

Game adaptation of the official L1 Atrium A+B venue plan. Not a navigation map or a live tenant directory. Only L1 is represented; additional floors are not implied.

- `shops.js`: all shop names, source unit numbers, categories, positions and sizes. `confirmed` means the **name appears in the source**, not that it is a verified current tenant. Unnamed units retain the source's unit numbers. Geometry is simplified; grouped units stay grouped. The 52 drawn regions are all labeled.
- `shop-room.png`: neutral generated pixel-art room with no branding or baked-in text. Changing a shop's `name` updates the map, directory and detail dialog automatically.
- `map.js`: rendering, search, zoom, pan and dialogs.
- `map.css`: responsive layout and scenery.
- `art-direction.txt`: generation prompt brief and tool provenance.

Source: https://www.metrocityplaza.com/xml/images/ExhibitionArea/1/FloorPlan/1/MCP2%28L1%29AtriumA_B.pdf

To change a shop, edit its `name`, `unit` and `category` in `shops.js`. To adjust the game layout, edit `x`, `y`, `w`, `h` and `door`. No image regeneration is needed to rename shops.
