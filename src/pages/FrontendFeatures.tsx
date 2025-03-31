import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainLayout from "../components/layout/MainLayout";
import FeatureBoard from "../components/features/FeatureBoard";
import FeatureModal from "../components/features/FeatureModal";
import { setActiveTeam, setModalOpen } from "../store/featureSlice";
import { RootState } from "../store";

const FrontendFeatures = () => {
  const dispatch = useDispatch();
  const { modalOpen } = useSelector((state: RootState) => state.features);

  useEffect(() => {
    dispatch(setActiveTeam("frontend"));
  }, [dispatch]);

  return (
    <MainLayout>
      <FeatureBoard />
      <FeatureModal
        isOpen={modalOpen}
        onClose={() => dispatch(setModalOpen(false))}
      />
    </MainLayout>
  );
};

export default FrontendFeatures;
