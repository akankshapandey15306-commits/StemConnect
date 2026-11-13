
from app.services.hla_matching import parse_hla, compare_hla


print(parse_hla("A*08:89 B*76:98 C*65:45"))

print(
    compare_hla(
        "A*08:89 B*76:98 C*65:45",
        "A*08:89 B*76:98 C*65:45",
    )
)

print(
    compare_hla(
        None,
        "A*08:89 B*76:98 C*65:45",
    )
)
