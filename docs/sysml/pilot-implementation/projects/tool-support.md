# Repo map: tool-support

Drawn by aider 0.86.2 on November 5, 2026 with `draw-maps.sh`, from [`tool-support`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02/tool-support) at commit [`378a870`](https://github.com/Systems-Modeling/SysML-v2-Pilot-Implementation/tree/378a8700c0bc5dfc08a97a5bb637f61dd8cfed02), with `--subtree-only --map-tokens 4096`. Git tracks 380 files there; aider read the 94 that `pilot.aiderignore` leaves in, and the map shows 94 of them, 8 with definitions. [The README](../README.md) says how to read it and what it leaves out.

```text
tool-support/bnf_grammar_tools/.gitignore

tool-support/bnf_grammar_tools/README.adoc

tool-support/bnf_grammar_tools/__init__.py

tool-support/bnf_grammar_tools/bnf_file_parser.log

tool-support/bnf_grammar_tools/bnf_file_parser.log.backup

tool-support/bnf_grammar_tools/bnf_grammar/__init__.py

tool-support/bnf_grammar_tools/bnf_grammar/bnf_file_parser.py:
⋮
│class BnfParser:
│    def __init__(self) -> None:
│        self.start_timestamp: Optional[datetime] = None
│        self.bnf_filepath: Optional[str] = None
⋮
│    def parse(self, bnf_filepath: str) -> None:
⋮
│def main() -> None:
⋮

tool-support/bnf_grammar_tools/bnf_grammar/bnf_grammar_processor.py:
⋮
│class TokenKind(Enum):
⋮
│class RenderMode(Enum):
⋮
│@dataclass
│class Token:
⋮
│@dataclass
│class ListStackItem:
⋮
│@dataclass
│class Grammar:
⋮
│@dataclass
│class GrammarElement:
│    """Abstract superclass for any element of the internal grammar metamodel"""
⋮
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│    def get_as_dict(self) -> dict[str, Any]:
⋮
│    @staticmethod
│    def get_safe_anchor_id(candidate_anchor_id: str) -> str:
⋮
│class Comment(GrammarElement):
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class Info(GrammarElement):
│    source: str
⋮
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class Heading(GrammarElement):
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class Production(GrammarElement):
│    name: str
⋮
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class Image(GrammarElement):
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class NoteRef(GrammarElement):
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│@dataclass
│class NoteList(GrammarElement):
│    html_snippet: str
│
│    def get_marked_up_txt(self) -> str:
⋮
│    def get_txt(self) -> str:
⋮
│    def get_html(self) -> str:
⋮
│class GrammarProcessor:
│    """
│    Grammar processor that handles KerML and SysML2 BNF grammars
│
│    The processor has two main methods:
│    - extract_bnf_from_spec(...): extracts BNF grammar snippets from a given KerML or SysML spec fi
│    - process_marked_up_bnf(...): processes a (corrected) BNF grammar from a given KerML or SysML m
│
│    Both can process two kinds of grammars:
│    - concrete textual notation
│    - concrete graphical notation
│
⋮
│    def __init__(self):
⋮
│    def extract_bnf_from_spec(self, input_dir: str, output_dir: str, input_file: str, syntax_kind: 
⋮
│    def parse_marked_up_bnf(self, input_dir: str, output_dir: str, input_file: str, syntax_kind: st
⋮
│    def rewrite_img_element(self, current_production: Production, img_count: int, img_index: int, l
⋮
│    def cleanup_note_html(self, pe: PageElement) -> None:
⋮
│    @staticmethod
│    def tokenize(line: str) -> list[Token]:
⋮
│    @staticmethod
│    def wrap_sorted(words: Iterable[str], sep: str = " ", reverse: bool = False, width: int = 120) 
⋮
│    def report_checks(self) -> None:
⋮
│    def dump_bnf_grammar_elements(self):
⋮
│    def export_marked_up_bnf(self):
⋮
│    def export_plain_bnf(self):
⋮
│    def export_html(self):
⋮
│class DATA:
⋮
│def line_comment(text: str, add_newline: bool = True):
⋮
│def block_comment(texts: list[str], add_newline: bool = True):
⋮
│def report_non_ascii(text: str):
⋮
│def clean_text_content(text: Optional[str], correct_comma_dot: bool = False) -> str:
⋮
│def clean_line(line: str) -> str:
⋮
│def normalize_whitespace(text: str) -> str:
⋮
│def remove_html_tags(text: str) -> str:
⋮
│def remove_ws_surrounding_list_elements(html_snippet: str) -> str:
⋮
│def is_pascal_case(text: str) -> bool:
⋮
│def is_upper_snake_case(text: str) -> bool:
⋮
│def is_lower_kebab_case(text: str) -> bool:
⋮
│def render_nested_lists(html_snippet: str, mode: RenderMode, apply_line_comment: bool) -> str:
⋮
│def main() -> None:
⋮

tool-support/bnf_grammar_tools/bnf_grammar/kebnf_textual_grammar.lark

tool-support/bnf_grammar_tools/bnf_grammar/kgbnf_graphical_grammar.lark

tool-support/bnf_grammar_tools/bnf_grammar_processor.log

tool-support/bnf_grammar_tools/bnf_grammar_processor.log.backup

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-corrected-elements.j

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-corrected-marked_up.

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-corrected.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-corrected.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-elements.json

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf-marked_up.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/KerML-textual-bnf.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-corrected-elements

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-corrected-marked_u

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-corrected.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-corrected.kgbnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-elements.json

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf-marked_up.kgbnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-graphical-bnf.kgbnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-corrected-elements.j

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-corrected-marked_up.

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-corrected.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-corrected.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-elements.json

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf-marked_up.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/SysML-textual-bnf.kebnf

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_file_parser--KerML-textual-correct

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_file_parser--SysML-graphical-corre

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_file_parser--SysML-textual-correct

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_grammar_processor--corrected.log

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_grammar_processor--extracted.log

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/bnf_styles.css

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_grammars/source_marked_ups.json

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_spec_sources/KerML-spec-r2025-04_REF.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_spec_sources/KerML-spec.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_spec_sources/SysML-spec-r2025-04_REF.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_spec_sources/SysML-spec.html

tool-support/bnf_grammar_tools/tests/KerML_and_SysML_spec_sources/source_specs.json

tool-support/bnf_grammar_tools/unittests/__init__.py

tool-support/bnf_grammar_tools/unittests/test_render_nested_lists.py:
⋮
│class TestRenderNestedLists(unittest.TestCase):
│
│    def test_render_nested_lists(self):
│        html_snippet = "<ol><li>One</li><li>Two<ul><li>Two sub one</li><li>Two sub two</li></ul>Two
│        self.assertEqual(bgp.render_nested_lists(html_snippet, bgp.RenderMode.TXT, False), """\
│  1. One
│  2. Two
│    • Two sub one
│    • Two sub two
│  Two continued""")
│
│        self.assertEqual(bgp.render_nested_lists(html_snippet, bgp.RenderMode.TXT, True), """\
⋮

tool-support/quantities_lib_generator/.gitignore

tool-support/quantities_lib_generator/README.adoc

tool-support/quantities_lib_generator/data/iso-iec-80000/iso_iec_80000_quantities_and_units.xlsx

tool-support/quantities_lib_generator/data_and_dictionaries.py

tool-support/quantities_lib_generator/data_templates.py:
│class DATA:
⋮

tool-support/quantities_lib_generator/iso_iec_80000_references.py

tool-support/quantities_lib_generator/libs_generated/ISQAcoustics.sysml

tool-support/quantities_lib_generator/libs_generated/ISQAtomicNuclear.sysml

tool-support/quantities_lib_generator/libs_generated/ISQBase.sysml

tool-support/quantities_lib_generator/libs_generated/ISQCharacteristicNumbers.sysml

tool-support/quantities_lib_generator/libs_generated/ISQChemistryMolecular.sysml

tool-support/quantities_lib_generator/libs_generated/ISQCondensedMatter.sysml

tool-support/quantities_lib_generator/libs_generated/ISQElectromagnetism.sysml

tool-support/quantities_lib_generator/libs_generated/ISQInformation.sysml

tool-support/quantities_lib_generator/libs_generated/ISQLight.sysml

tool-support/quantities_lib_generator/libs_generated/ISQMechanics.sysml

tool-support/quantities_lib_generator/libs_generated/ISQSpaceTime.sysml

tool-support/quantities_lib_generator/libs_generated/ISQThermodynamics.sysml

tool-support/quantities_lib_generator/libs_generated/SI_collected_units.txt

tool-support/quantities_lib_generator/libs_generated/SI_snippet.sysml

tool-support/quantities_lib_generator/libs_generated/registered_quantities.csv

tool-support/quantities_lib_generator/quantities_lib_generator.py:
⋮
│class QuantityDimension:
│    def __init__(self):
│        self.power_factors: dict["BaseQuantity", int] = {}
│        quantities = ISQuantity.reg_name_std.values()
│        for quantity in quantities:
│            if isinstance(quantity, BaseQuantity) and quantity.symbol != "1":
⋮
│    def add_power_factor(self, quantity: "ISQuantity", exponent: int):
⋮
│    def __str__(self):
⋮
│    def canonical_unit(self):
⋮
│    @staticmethod
│    def derive_quantity_dimension(unit: str) -> "QuantityDimension":
⋮
│class ISQuantity(ABC):
│    """representation of quantity defined in ISO/IEC 80000"""
⋮
│    @abstractmethod
│    def __init__(self, name_std: str, name_sysml: str, symbol: str, unit_name: str, unit_symbol: st
⋮
│    def init_quantity_dimension(self):
⋮
│    def canonical_unit(self):
⋮
│    def __repr__(self):
⋮
│class BaseQuantity(ISQuantity):
│    def __init__(self, name_std: str, name_sysml: str, symbol: str, unit_name: str, unit_symbol: st
⋮
│    def init_quantity_dimension(self):
⋮
│class SpecialQuantity(ISQuantity):
│    def __init__(self, name_std: str, name_sysml: str, symbol: str, unit_name: str, unit_symbol: st
│        super().__init__(name_std, name_sysml, symbol, unit_name, unit_symbol, specializes)
⋮
│    def init_quantity_dimension(self):
⋮
│class RecognizedQuantity(ISQuantity):
│    def __init__(self, name_std: str, name_sysml: str, symbol: str, unit_name: str, unit_symbol: st
│        super().__init__(name_std, name_sysml, symbol, unit_name, unit_symbol, specializes)
│        self.definition_value = definition_value
⋮
│    def init_quantity_dimension(self):
⋮
│@dataclass
│class GeneratedQuantity:
│    reference_source: ReferenceSource
⋮
│    def __repr__(self):
⋮
│@dataclass
│class SiUnit:
⋮
│@dataclass
│class IsoIecQuantityDefinition:
│    sort_key: int
⋮
│    def __init__(self, record: dict[str, any]):
⋮
│class Generator:
│    def __init__(self):
│        self.unit_to_quantity_dimension_map = {}
│        self.iso_iec_quantity_definitions: list[IsoIecQuantityDefinition] = []
│        self.unit_symbols_set: set[str] = set()
│        self.units_dict: dict[str, SiUnit] = {}
│        self.generated_quantities_dict: dict[str, GeneratedQuantity] = {}
│        self.generated_coordinate_frames: set[str] = set()
│        self.output_dir_name: str = "libs_generated"
│
│        # Create output directory if it does not yet exist
⋮
│    def generate_quantities_and_measurement_references(self, working_dir: str, quantities_file_name
⋮
│    def generate_sysml_quantities_library_package(self, part_number: int, time_stamp: str, base_fil
│
⋮
│    @staticmethod
│    def create_scalar_alias_snippets(alias_list: list[str], quantity_name: str, general_quantity_na
│
⋮
│    @staticmethod
│    def create_vector_alias_snippets(alias_list: list[str], quantity_name: str, general_quantity_na
│
⋮
│    def create_used_measurement_units_list(self):
⋮
│    @staticmethod
│    def create_quantity_documentation_snippet(
│            item_source: str, symbols: str, application_domain: str, quantity_name: str,
│            quantity_dimension: QuantityDimension, measurement_units: str, tensor_order: int, defin
⋮
│    @staticmethod
│    def create_simple_or_derived_quantity_snippet(
│            std_quantity_name: str, item_source: str, symbols: str, application_domain: str, quanti
│            quantity_dimension: QuantityDimension, measurement_units: str, tensor_order: int, defin
⋮
│    @staticmethod
│    def create_specialized_quantity_snippet(
│            item_source: str, symbols: str, application_domain: str, quantity_name: str,
│            quantity_dimension: QuantityDimension, measurement_units: str, tensor_order: int,
│            definition: str, remarks: str, general_quantity_name: str,
⋮
│    @staticmethod
│    def create_vector_quantity_snippet(
│            std_quantity_name: str, item_source: str, symbols: str, application_domain: str, quanti
│            quantity_dimension: QuantityDimension, measurement_units: str, tensor_order: int,
│            definition: str, remarks: str, general_quantity_name: str, magnitude_quantity_name: str
⋮
│    @staticmethod
│    def create_coordinate_frame_snippet(coordinate_frame_name: str, doc_snippet: str, is_bound_stri
⋮
│    @staticmethod
│    def create_tensor_quantity_snippet(
│            std_quantity_name: str, item_source: str, symbols: str, application_domain: str, quanti
│            quantity_dimension: QuantityDimension, measurement_units: str, tensor_order: int,
⋮
│def verbalize_unit(unit_symbol: str) -> str:
⋮

tool-support/quantities_lib_generator/reference_source.py:
⋮
│@dataclass
│class ReferenceSource:
⋮

tool-support/quantities_lib_generator/unicode_characters.py

tool-support/quantities_lib_generator/utils.py:
⋮
│def c(level: int, statement: str, newline: bool = True) -> str:
⋮
│def removeprefix(s: str, prefix: str) -> str:
⋮
│def removesuffix(s: str, suffix: str) -> str:
⋮
│def quote_non_ascii(name: str) -> str:
⋮
│def convert_excel_boolean(val: Union[str, bool]) -> Optional[bool]:
⋮
│def is_length_unit_name(unit_name: str) -> bool:
⋮
│def convert_phrase_to_pascal_case(name: str) -> str:
⋮
│def convert_to_lowercase_first_letter(name: str) -> str:
⋮
│def convert_unit_to_unicode(unit_symbol: str) -> str:
⋮
│def quote_non_basic_identifier(name: str) -> str:
⋮
│def quote_embedded_unit_names(unit_symbol: str) -> str:
⋮

tool-support/syntax-highlighting/README.md

tool-support/syntax-highlighting/jetbrains/KerML.xml

tool-support/syntax-highlighting/jetbrains/SysML.xml

tool-support/syntax-highlighting/jupyter/additional_def_keywords.txt

tool-support/syntax-highlighting/jupyter/mode.ts

tool-support/syntax-highlighting/jupyter/mode_template.ts

tool-support/syntax-highlighting/vscode/kerml/.vscodeignore

tool-support/syntax-highlighting/vscode/kerml/CHANGELOG.md

tool-support/syntax-highlighting/vscode/kerml/language-configuration.json

tool-support/syntax-highlighting/vscode/kerml/package.json

tool-support/syntax-highlighting/vscode/kerml/syntaxes/kerml.tmLanguage.json

tool-support/syntax-highlighting/vscode/kerml/vsc-extension-quickstart.md

tool-support/syntax-highlighting/vscode/sysml/.vscodeignore

tool-support/syntax-highlighting/vscode/sysml/CHANGELOG.md

tool-support/syntax-highlighting/vscode/sysml/language-configuration.json

tool-support/syntax-highlighting/vscode/sysml/package.json

tool-support/syntax-highlighting/vscode/sysml/syntaxes/sysml.tmLanguage.json

tool-support/syntax-highlighting/vscode/sysml/vsc-extension-quickstart.md

tool-support/syntax-highlighting/xtext_grammar_converter.py:
⋮
│class DATA:
⋮
│class Converter(object):
│    """
│    Converter from xtext grammar definition file to TextMate grammar
⋮
│    def __init__(self, repo_dir_path):
⋮
│    def parse_xtext_grammar(self, xtext_source_paths: List[str]):
│
⋮
│    def export_text_mate_language_file(self, target_path: str):
│
⋮
│    def export_jetbrains_language_file(self, target_path: str):
│
⋮
│    def export_jupyter_syntax_highlighting_files(
│            self,
│            working_folder: str,
⋮
│    def get_relative_repo_path(self, abspath: str):
⋮
│    @staticmethod
│    def escape_regex(s: str) -> str:
⋮
│    @staticmethod
│    def convert_xml_special(s: str) -> str:
⋮
```
