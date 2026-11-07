# Repo map: doc/content

Drawn by aider 0.86.2 on November 7, 2026 with `draw-maps.sh`, from [`doc/content`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858/doc/content) at commit [`7e33415`](https://github.com/eclipse-syson/syson/tree/7e3341586f9049c36cf8c5dfbdd08933a1d53858), with `--subtree-only --map-tokens 4096`. Git tracks 596 files there; aider read the 201 that `syson.aiderignore` leaves in, and the map shows 201 of them, 12 with definitions. [The README](../../README.md) says how to read it and what it leaves out.

```text
doc/content/README

doc/content/antora.yml

doc/content/modules/ROOT/README

doc/content/modules/ROOT/assets/README

doc/content/modules/ROOT/assets/attachments/README

doc/content/modules/ROOT/assets/images/README

doc/content/modules/ROOT/examples/README

doc/content/modules/ROOT/nav.adoc

doc/content/modules/ROOT/pages/README

doc/content/modules/ROOT/pages/faq.adoc

doc/content/modules/ROOT/pages/features.adoc

doc/content/modules/ROOT/pages/get-started.adoc

doc/content/modules/ROOT/pages/help.adoc

doc/content/modules/ROOT/pages/index.adoc

doc/content/modules/ROOT/pages/integration.adoc

doc/content/modules/ROOT/pages/introduction.adoc

doc/content/modules/ROOT/pages/reference.adoc

doc/content/modules/ROOT/pages/release-notes.adoc

doc/content/modules/ROOT/pages/security-policy.adoc

doc/content/modules/ROOT/pages/user-interface-overview.adoc

doc/content/modules/ROOT/partials/README

doc/content/modules/developer-guide/README

doc/content/modules/developer-guide/assets/README

doc/content/modules/developer-guide/assets/attachments/README

doc/content/modules/developer-guide/assets/attachments/sirius-web-openapi.json

doc/content/modules/developer-guide/assets/images/README

doc/content/modules/developer-guide/assets/images/dev-guide-how-to-create-a-service.bpmn

doc/content/modules/developer-guide/examples/README

doc/content/modules/developer-guide/examples/create_project.py:
⋮
│def create_project(host, project_name): # <2>
⋮

doc/content/modules/developer-guide/examples/delete_element.py:
⋮
│def fetch_element(host, project_id, commit_id, element_id):  # <2>
⋮
│def delete_element(host, project_id, element_id):  # <5>
⋮

doc/content/modules/developer-guide/examples/download_sysml_file.py:
⋮
│def get_graphql_url(url):
⋮
│def get_download_url(url, editing_context_id, document_id):
⋮
│def print_graphql_errors(data):
⋮
│def fetch_editing_context_id(url, project_id):  # <2>
⋮
│def download_sysml_file(url, project_id, document_id, output_path):  # <3>
⋮
│def parse_arguments():
⋮

doc/content/modules/developer-guide/examples/fetch_commits.py:
⋮
│def fetch_commits(host, project_id):  # <2>
⋮
│def get_last_commit_id(host, project_id):
⋮

doc/content/modules/developer-guide/examples/fetch_elements.py:
⋮
│def fetch_elements(host, project_id):  # <2>
⋮

doc/content/modules/developer-guide/examples/fetch_projects.py:
⋮
│def fetch_projects(host): # <2>
⋮

doc/content/modules/developer-guide/examples/get_feature_members.py:
⋮
│def get_member_features(host, project_id, commit_id, element_id, member_type, indent):
⋮

doc/content/modules/developer-guide/examples/get_owned_elements.py:
⋮
│def get_element(host, project_id, commit_id, element_id, indent):
⋮
│def get_owned_elements_immediate(host, project_id, commit_id, element_id, indent):
⋮
│def get_owned_elements(host, project_id, commit_id, element_id, indent):
⋮

doc/content/modules/developer-guide/examples/import_sysml_file.py:
⋮
│def get_graphql_url(url):
⋮
│def get_graphql_upload_url(url):
⋮
│def print_graphql_errors(data):
⋮
│def fetch_editing_context_id(url, project_id):  # <2>
⋮
│def print_messages(messages):
⋮
│def import_sysml_file(url, file_path, editing_context_id, read_only):  # <3>
⋮
│def parse_arguments():
⋮

doc/content/modules/developer-guide/examples/init_api.py:
⋮
│def init_sysmlv2_api():
⋮
│def parse_arguments():
⋮

doc/content/modules/developer-guide/examples/new_objects_from_text.py:
⋮
│def fetch_editing_context(url, project_id): # <2>
⋮
│def import_sysml_to_project(url, file_path, editing_context_id, object_id): # <3>
⋮

doc/content/modules/developer-guide/examples/retrieve_project_documents.py:
⋮
│def get_project_download_url(url, project_id):
⋮
│def download_project_archive(url, project_id):  # <2>
⋮
│def parse_arguments():
⋮

doc/content/modules/developer-guide/pages/README

doc/content/modules/developer-guide/pages/api/api-cookbook.adoc

doc/content/modules/developer-guide/pages/api/api-details.adoc

doc/content/modules/developer-guide/pages/api/api.adoc

doc/content/modules/developer-guide/pages/elasticsearch-integration.adoc

doc/content/modules/developer-guide/pages/extend.adoc

doc/content/modules/developer-guide/pages/index.adoc

doc/content/modules/developer-guide/pages/release-process.adoc

doc/content/modules/developer-guide/partials/README

doc/content/modules/developer-guide/partials/create_element_recipe.adoc

doc/content/modules/developer-guide/partials/delete_element_recipe.adoc

doc/content/modules/developer-guide/partials/download_sysml_file_recipe.adoc

doc/content/modules/developer-guide/partials/element_owned_elements_recipe.adoc

doc/content/modules/developer-guide/partials/import_sysml_file_recipe.adoc

doc/content/modules/developer-guide/partials/nav.adoc

doc/content/modules/developer-guide/partials/new_objects_from_text.adoc

doc/content/modules/developer-guide/partials/project_commit_branch_tag_recipe.adoc

doc/content/modules/developer-guide/partials/retrieve_project_documents_recipe.adoc

doc/content/modules/installation-guide/README

doc/content/modules/installation-guide/assets/README

doc/content/modules/installation-guide/assets/attachments/README

doc/content/modules/installation-guide/assets/images/README

doc/content/modules/installation-guide/assets/images/download.excalidraw

doc/content/modules/installation-guide/examples/README

doc/content/modules/installation-guide/pages/README

doc/content/modules/installation-guide/pages/anti-virus.adoc

doc/content/modules/installation-guide/pages/architecture.adoc

doc/content/modules/installation-guide/pages/how-tos/https.adoc

doc/content/modules/installation-guide/pages/how-tos/install.adoc

doc/content/modules/installation-guide/pages/how-tos/install/ecosystem_only.adoc

doc/content/modules/installation-guide/pages/how-tos/install/local_test.adoc

doc/content/modules/installation-guide/pages/how-tos/install/multi_user_test.adoc

doc/content/modules/installation-guide/pages/how-tos/install/production_deploy.adoc

doc/content/modules/installation-guide/pages/index.adoc

doc/content/modules/installation-guide/pages/migration-process.adoc

doc/content/modules/installation-guide/pages/requirements.adoc

doc/content/modules/installation-guide/pages/troubleshooting.adoc

doc/content/modules/installation-guide/partials/README

doc/content/modules/installation-guide/partials/nav.adoc

doc/content/modules/product-legal/README

doc/content/modules/product-legal/assets/README

doc/content/modules/product-legal/assets/attachments/README

doc/content/modules/product-legal/assets/images/README

doc/content/modules/product-legal/examples/README

doc/content/modules/product-legal/examples/eplv2-license.txt

doc/content/modules/product-legal/pages/README

doc/content/modules/product-legal/pages/index.adoc

doc/content/modules/product-legal/partials/README

doc/content/modules/user-manual/README

doc/content/modules/user-manual/assets/README

doc/content/modules/user-manual/assets/attachments/README

doc/content/modules/user-manual/assets/images/README

doc/content/modules/user-manual/examples/README

doc/content/modules/user-manual/pages/README

doc/content/modules/user-manual/pages/best-practices.adoc

doc/content/modules/user-manual/pages/concepts.adoc

doc/content/modules/user-manual/pages/contribute.adoc

doc/content/modules/user-manual/pages/cycle.adoc

doc/content/modules/user-manual/pages/faq/faq.adoc

doc/content/modules/user-manual/pages/features/action-flow-view.adoc

doc/content/modules/user-manual/pages/features/cm.adoc

doc/content/modules/user-manual/pages/features/collaboration.adoc

doc/content/modules/user-manual/pages/features/cross-project-search.adoc

doc/content/modules/user-manual/pages/features/details.adoc

doc/content/modules/user-manual/pages/features/diagramming-tools.adoc

doc/content/modules/user-manual/pages/features/editor.adoc

doc/content/modules/user-manual/pages/features/explorer.adoc

doc/content/modules/user-manual/pages/features/expressions.adoc

doc/content/modules/user-manual/pages/features/features.adoc

doc/content/modules/user-manual/pages/features/general-view.adoc

doc/content/modules/user-manual/pages/features/homepage.adoc

doc/content/modules/user-manual/pages/features/import-export-textual.adoc

doc/content/modules/user-manual/pages/features/interconnection-view.adoc

doc/content/modules/user-manual/pages/features/keyboard-shortcuts.adoc

doc/content/modules/user-manual/pages/features/library-import.adoc

doc/content/modules/user-manual/pages/features/mbse-capability.adoc

doc/content/modules/user-manual/pages/features/other-views.adoc

doc/content/modules/user-manual/pages/features/parametric-modeling.adoc

doc/content/modules/user-manual/pages/features/publication.adoc

doc/content/modules/user-manual/pages/features/query-view.adoc

doc/content/modules/user-manual/pages/features/related-elements.adoc

doc/content/modules/user-manual/pages/features/representations-view.adoc

doc/content/modules/user-manual/pages/features/requirement-management.adoc

doc/content/modules/user-manual/pages/features/scaling-limits.adoc

doc/content/modules/user-manual/pages/features/security.adoc

doc/content/modules/user-manual/pages/features/simulation.adoc

doc/content/modules/user-manual/pages/features/state-transition-view.adoc

doc/content/modules/user-manual/pages/features/sysmlv2-overview.adoc

doc/content/modules/user-manual/pages/features/validation.adoc

doc/content/modules/user-manual/pages/forum.adoc

doc/content/modules/user-manual/pages/hands-on/hands-on.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/explorer.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/model-management.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/project-management.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/representation-operations.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/representations-view.adoc

doc/content/modules/user-manual/pages/hands-on/how-tos/user-interface-navigation.adoc

doc/content/modules/user-manual/pages/hands-on/tutorials/batmobile.adoc

doc/content/modules/user-manual/pages/hands-on/tutorials/flashlight.adoc

doc/content/modules/user-manual/pages/hands-on/tutorials/tutorials.adoc

doc/content/modules/user-manual/pages/help.adoc

doc/content/modules/user-manual/pages/index.adoc

doc/content/modules/user-manual/pages/integration.adoc

doc/content/modules/user-manual/pages/integration/capella.adoc

doc/content/modules/user-manual/pages/integration/interoperability.adoc

doc/content/modules/user-manual/pages/key-features.adoc

doc/content/modules/user-manual/pages/release-notes/2023.12.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.1.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.11.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.3.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.5.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.7.0.adoc

doc/content/modules/user-manual/pages/release-notes/2024.9.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.1.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.10.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.12.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.2.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.4.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.6.0.adoc

doc/content/modules/user-manual/pages/release-notes/2025.8.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.1.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.11.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.3.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.5.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.7.0.adoc

doc/content/modules/user-manual/pages/release-notes/2026.9.0.adoc

doc/content/modules/user-manual/pages/release-notes/release-notes.adoc

doc/content/modules/user-manual/pages/resources.adoc

doc/content/modules/user-manual/pages/support.adoc

doc/content/modules/user-manual/pages/tour.adoc

doc/content/modules/user-manual/pages/updates.adoc

doc/content/modules/user-manual/pages/user-interface-overview.adoc

doc/content/modules/user-manual/pages/what-is.adoc

doc/content/modules/user-manual/partials/README

doc/content/modules/user-manual/partials/before-you-start-experimental-all.adoc

doc/content/modules/user-manual/partials/feature-os.adoc

doc/content/modules/user-manual/partials/feature-status-experimental.adoc

doc/content/modules/user-manual/partials/feature-status-stable.adoc

doc/content/modules/user-manual/partials/feature-usage-admin.adoc

doc/content/modules/user-manual/partials/feature-usage-all.adoc

doc/content/modules/user-manual/partials/help-action.adoc

doc/content/modules/user-manual/partials/homepage-action.adoc

doc/content/modules/user-manual/partials/intro.adoc

doc/content/modules/user-manual/partials/libraries-action.adoc

doc/content/modules/user-manual/partials/manage-drag-drop.adoc

doc/content/modules/user-manual/partials/manage-elements-diagram.adoc

doc/content/modules/user-manual/partials/manage-existing-elements.adoc

doc/content/modules/user-manual/partials/manage-group-elements.adoc

doc/content/modules/user-manual/partials/manage-labels-diagram.adoc

doc/content/modules/user-manual/partials/manage-relationships-diagram.adoc

doc/content/modules/user-manual/partials/manage-toolbar-diagram.adoc

doc/content/modules/user-manual/partials/nav-features.adoc

doc/content/modules/user-manual/partials/nav-help.adoc

doc/content/modules/user-manual/partials/nav-howtos.adoc

doc/content/modules/user-manual/partials/nav-integration.adoc

doc/content/modules/user-manual/partials/nav-intro.adoc

doc/content/modules/user-manual/partials/nav-tuto.adoc

doc/content/modules/user-manual/partials/nav-ui.adoc

doc/content/modules/user-manual/partials/nav-updates.adoc

doc/content/modules/user-manual/partials/projects-action.adoc

doc/content/modules/user-manual/partials/view-unsynchronized.adoc
```
