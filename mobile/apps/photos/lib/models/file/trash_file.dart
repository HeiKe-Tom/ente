import "package:photo_manager/photo_manager.dart";
import 'package:photos/models/file/file.dart';
import "package:photos/models/file/file_type.dart";

sealed class TrashFile extends EnteFile {
  TrashFile();

  TrashFile.from(super.file, {required this.deleteBy}) : super.from();

  // time after which will will be deleted from trash & user's storage usage
  // will go down
  late int deleteBy;
}

class EnteTrashFile extends TrashFile {
  EnteTrashFile();

  EnteTrashFile.from(
    super.file, {
    required super.deleteBy,
    required this.createdAt,
    required this.updateAt,
  }) : super.from() {
    if (localID != null) {
      generatedID = -int.parse(localID!);
    }
  }

  // time when file was put in the trash for first time
  late int createdAt;

  // for non-deleted trash items, updateAt is usually equal to the latest time
  // when the file was moved to trash
  late int updateAt;
}

class DeviceTrashFile extends TrashFile {
  DeviceTrashFile();

  DeviceTrashFile.from(super.file, {required super.deleteBy}) : super.from();
}

AssetEntity trashFileToAssetEntity(EnteFile file) {
  return AssetEntity(
    id: file.localID!,
    typeInt: switch (file.fileType) {
      FileType.image || FileType.livePhoto => AssetType.image.index,
      FileType.video => AssetType.video.index,
      FileType.other => AssetType.other.index,
    },
    width: 0,
    height: 0,
  );
}
